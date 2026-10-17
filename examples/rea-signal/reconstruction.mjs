// Original source-assisted reconstruction. No import of the reference scene.
import {clamp, smooth, progress, spring, hash} from '../../lib/motion.mjs';
import {compileProject, eventTime} from '../../lib/project.mjs';

export function poseAt(seconds,project,spec){
  if(!Number.isFinite(seconds))throw TypeError('seek expects finite seconds');
  const time=clamp(seconds,0,project.duration),at=id=>eventTime(project,id);
  const m=spec.sourceCodeMeasurements,center=[project.width/2,project.height/2];
  const phase=(a,b)=>smooth(progress(time,a,b));
  const contact=at('contact'),age=Math.max(0,time-contact);
  const assembled=phase(at('split'),at('align')),resolved=phase(at('align'),at('resolve'));
  const travel=phase(at('arrival')-.4,contact);
  const signal=m.signalStart.map((value,axis)=>value+(center[axis]-value)*travel);
  signal[1]-=m.travelLift*Math.sin(Math.PI*travel);
  const fragments=m.spreadFrequencyHz.map((frequencyHz,index)=>{
    const localAge=time-contact-index*m.fragmentDelaySeconds;
    const spread=spring(localAge,{frequencyHz,dampingRatio:m.spreadDampingRatio});
    const angle=index*2*Math.PI/3-Math.PI/2+m.initialAngularOffset*(1-assembled)
      +m.holdAngularAmplitude*Math.sin((time-at('resolve'))*m.holdAngularFrequencyRadiansPerSecond)*resolved;
    const distance=m.clusterRadius+(m.spreadRadius-m.clusterRadius)*spread+m.assemblyExtraRadius*Math.sin(Math.PI*assembled);
    const vibration=1+.035*Math.exp(-4*Math.max(0,localAge))*Math.sin(20*Math.max(0,localAge));
    return {position:[center[0]+Math.cos(angle)*distance,center[1]+Math.sin(angle)*distance],angle:angle+Math.PI/2,radii:[m.fragmentRadii[0]*vibration,m.fragmentRadii[1]/vibration]};
  });
  const pulse=Math.exp(-5*age)*Math.sin(17*age);
  return {time,center,fragments,signal,signalRadii:[m.signalRadius*(1-.15*pulse),m.signalRadius*(1+.15*pulse)],
    alpha:phase(0,.3)*(1-phase(at('exit'),project.duration)),opening:phase(at('arrival'),contact),resolved,
    wave:time<contact?null:progress(time,contact,contact+m.waveSeconds),
    coreRadius:11+3*spring(time-contact,{frequencyHz:2.2,dampingRatio:.78})};
}

async function boot(){
  const load=async name=>{const response=await fetch(new URL(name,import.meta.url));if(!response.ok)throw Error(`${name}: HTTP ${response.status}`);return response.json();};
  const [raw,spec]=await Promise.all([load('project.json'),load('spec.json')]);
  const project=compileProject(raw),params=new URLSearchParams(location.search),scale=Number(params.get('scale')??1);
  if(!Number.isFinite(scale)||scale<=0||scale>2)throw Error('invalid scale');
  if(params.has('capture'))document.documentElement.dataset.capture='';
  const canvas=document.querySelector('#film'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  canvas.width=Math.round(project.width*scale);canvas.height=Math.round(project.height*scale);
  const palette=project.palette,m=spec.sourceCodeMeasurements,choices=spec.implementationChoices;
  const grain=Array.from({length:choices.grainCount},(_,i)=>[hash(project.seed,`rea:grain:x:${i}`)*project.width,hash(project.seed,`rea:grain:y:${i}`)*project.height,.4+1.2*hash(project.seed,`rea:grain:r:${i}`)]);
  function contour(points,{fill,stroke=palette.ink,width=2.5,alpha=1,closed=true},pose,id){
    ctx.save();ctx.globalAlpha*=alpha;ctx.beginPath();
    for(let i=0;i<points.length;i++){
      const tick=Math.floor(pose.time*m.contourHz);
      const x=points[i][0]+1.7*(hash(project.seed,`rea:${id}:${tick}:${i}:x`)-.5);
      const y=points[i][1]+1.7*(hash(project.seed,`rea:${id}:${tick}:${i}:y`)-.5);
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    if(closed)ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}
    ctx.restore();
  }
  function ellipse(position,radii,rotation,fill,pose,id,stroke=palette.ink){
    const points=Array.from({length:choices.ovalVertices},(_,i)=>{
      const a=i*2*Math.PI/choices.ovalVertices,dx=Math.cos(a)*radii[0],dy=Math.sin(a)*radii[1];
      return [position[0]+dx*Math.cos(rotation)-dy*Math.sin(rotation),position[1]+dx*Math.sin(rotation)+dy*Math.cos(rotation)];
    });
    contour(points,{fill,stroke},pose,id);
  }
  function arc(pose,radius,start,sweep,alpha,id,width=3){
    if(alpha<=0)return;
    const points=Array.from({length:choices.arcSegments+1},(_,i)=>{
      const angle=start+sweep*i/choices.arcSegments;return [pose.center[0]+radius*Math.cos(angle),pose.center[1]+radius*Math.sin(angle)];
    });
    contour(points,{alpha,width,closed:false},pose,id);
  }
  window.seek=seconds=>{
    const pose=poseAt(seconds,project,spec);
    ctx.reset();ctx.scale(canvas.width/project.width,canvas.height/project.height);
    ctx.fillStyle=palette.paper;ctx.fillRect(0,0,project.width,project.height);
    ctx.fillStyle=palette.ink;ctx.globalAlpha=.045;for(const [x,y,r] of grain)ctx.fillRect(x,y,r,r);
    ctx.globalAlpha=pose.alpha;ctx.translate(...pose.center);ctx.scale(m.viewScale,m.viewScale);ctx.translate(-pose.center[0],-pose.center[1]);
    arc(pose,m.outerRadius,m.arcStartRadians,m.arcSweepRadians*pose.opening,.28*(1-pose.resolved),'guide');
    pose.fragments.forEach((fragment,index)=>ellipse(fragment.position,fragment.radii,fragment.angle,[palette.sage,palette.clay,palette.gold][index],pose,`fragment-${index}`));
    ellipse(pose.signal,pose.signalRadii,0,palette.ink,pose,'impulse',null);
    if(pose.wave!==null)arc(pose,40+245*pose.wave,0,Math.PI*2,.5*(1-pose.wave),'wave');
    arc(pose,m.outerRadius,m.arcStartRadians,m.arcSweepRadians,.78*pose.resolved,'finish',4.5);
    ellipse(pose.center,[pose.coreRadius,pose.coreRadius],0,palette.gold,pose,'core',null);
    return {time:pose.time,ball:pose.signal.map((value,index)=>pose.center[index]+m.viewScale*(value-pose.center[index])),scale};
  };
  window.film={project};window.seek(0);await document.fonts.ready;
  const slider=document.querySelector('#scrub'),button=document.querySelector('#play'),clock=document.querySelector('#clock');
  slider.max=project.duration;
  let driver=null;
  const display=time=>{window.seek(time);slider.value=time;clock.value=`${time.toFixed(2)} s`;};
  const stop=()=>{driver=null;button.textContent='Play';};
  const frame=now=>{
    if(!driver)return;
    const time=Math.min(project.duration,driver.offset+(now-driver.origin)/1000);
    display(time);if(time===project.duration)stop();else requestAnimationFrame(frame);
  };
  slider.addEventListener('input',()=>{stop();display(Number(slider.value));});
  button.addEventListener('click',()=>{if(driver){stop();return;}driver={origin:performance.now(),offset:Number(slider.value)>=project.duration?0:Number(slider.value)};button.textContent='Pause';requestAnimationFrame(frame);});
  return true;
}
if(typeof window!=='undefined'){
  window.__motionReady=boot();
  window.__motionReady.catch(error=>{window.__motionError=String(error);console.error(error);});
}
