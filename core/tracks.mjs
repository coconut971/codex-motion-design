// Original analytic tracks. No simulation, scheduler or mutable playback state.
import {clamp, mix, spring} from '../lib/motion.mjs';

const finite = (v, name) => { if (!Number.isFinite(v)) throw Error(`${name} must be finite`); return v; };
export function cubicEase(x, points) {
  finite(x,'easing progress');
  if (!Array.isArray(points) || points.length !== 4 || !points.every(Number.isFinite) || points[0] < 0 || points[0] > 1 || points[2] < 0 || points[2] > 1) throw Error('cubic easing requires [x1,y1,x2,y2], x in [0,1]');
  const p = clamp(x); if (p === 0 || p === 1) return p;
  const curve = (t, a, b) => 3*(1-t)**2*t*a + 3*(1-t)*t*t*b + t**3;
  // Bounded bisection also handles a zero derivative at either endpoint.
  let lo = 0, hi = 1;
  for (let i=0;i<48;i++) { const t=(lo+hi)/2; if (curve(t,points[0],points[2]) < p) lo=t; else hi=t; }
  return curve((lo+hi)/2,points[1],points[3]);
}
export function easing(p, spec='smooth') {
  finite(p,'easing progress');
  if (Array.isArray(spec)) return cubicEase(p,spec);
  if (spec === 'linear') return clamp(p);
  if (spec === 'hold') return p >= 1 ? 1 : 0;
  if (spec === 'smooth') { const q=clamp(p);return q*q*(3-2*q); }
  throw Error(`unknown easing: ${spec}`);
}

/** Exact state under a constant target, arbitrary initial position/velocity. */
export function springState(t, x0, v0, target, {frequencyHz=3,dampingRatio=.8}={}) {
  [t,x0,v0,target].forEach(v=>finite(v,'spring state'));
  // Keep the legacy solver's parameter validation and mathematical foundation.
  spring(0,{frequencyHz,dampingRatio});
  if (t <= 0) return {value:x0,velocity:v0};
  const w=2*Math.PI*frequencyHz,z=dampingRatio,y=x0-target;
  let displacement,velocity;
  if (Math.abs(z-1)<1e-7) {
    const b=v0+w*y,e=Math.exp(-w*t);
    displacement=e*(y+b*t);velocity=e*(b-w*(y+b*t));
  } else if (z<1) {
    const a=z*w,d=w*Math.sqrt(1-z*z),b=(v0+a*y)/d,e=Math.exp(-a*t),c=Math.cos(d*t),s=Math.sin(d*t);
    displacement=e*(y*c+b*s);velocity=e*((b*d-a*y)*c+(-y*d-a*b)*s);
  } else {
    const q=z+Math.sqrt(z*z-1),r1=-w/q,r2=-w*q,a=(v0-r2*y)/(r1-r2),b=y-a;
    displacement=a*Math.exp(r1*t)+b*Math.exp(r2*t);velocity=a*r1*Math.exp(r1*t)+b*r2*Math.exp(r2*t);
  }
  return {value:target+displacement,velocity};
}

export function compileTrack(spec, time, {fallback=0,log=false}={}) {
  if (spec === undefined) spec=fallback;
  if (Number.isFinite(spec)) {
    if(log && spec<=0)throw Error('log track requires positive values');
    return ()=>spec;
  }
  if (!spec || typeof spec !== 'object') throw Error('track must be a number, keys or spring');
  if (spec.keys && spec.spring) throw Error('track cannot combine keys and spring');
  if (spec.keys) {
    if (!Array.isArray(spec.keys)||!spec.keys.length) throw Error('keys required');
    const keys=spec.keys.map(k=>({at:time(k.at),value:finite(k.value,'key value'),ease:k.ease??'smooth'}));
    for(let i=0;i<keys.length;i++) {
      if(i && keys[i].at<=keys[i-1].at)throw Error('key times must strictly increase');
      easing(.5,keys[i].ease);
      if(log && keys[i].value<=0)throw Error('log track requires positive keys');
    }
    return t=>{
      if(t<=keys[0].at)return keys[0].value;
      const b=keys.findIndex(k=>k.at>=t);if(b<0)return keys.at(-1).value;
      const a=keys[b-1],next=keys[b],p=easing((t-a.at)/(next.at-a.at),next.ease);
      return log?Math.exp(mix(Math.log(a.value),Math.log(next.value),p)):mix(a.value,next.value,p);
    };
  }
  if (spec.spring) {
    if(log)throw Error('log zoom accepts positive constants or keyframes');
    const s=spec.spring,initial=finite(s.initial,'spring initial'),velocity=finite(s.velocity??0,'spring velocity');
    if(!Array.isArray(s.targets))throw Error('spring targets required');
    let current={at:0,value:initial,velocity,target:initial,frequencyHz:s.frequencyHz??3,dampingRatio:s.dampingRatio??.8};
    spring(0,current);const segments=[current];
    for(const change of s.targets) {
      const at=time(change.at);if(at<current.at || (segments.length>1 && at===current.at))throw Error('spring target times must strictly increase');
      const state=springState(at-current.at,current.value,current.velocity,current.target,current);
      current={at,...state,target:finite(change.value,'target'),frequencyHz:change.frequencyHz??current.frequencyHz,dampingRatio:change.dampingRatio??current.dampingRatio};
      spring(0,current);segments.push(current);
    }
    const state=t=>{const segment=segments.findLast(k=>k.at<=t)??segments[0];return springState(t-segment.at,segment.value,segment.velocity,segment.target,segment);};
    const track=t=>state(t).value;track.state=state;return track;
  }
  throw Error('track needs keys or spring');
}
