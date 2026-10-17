import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {compileFilm} from '../core/film.mjs';
import {compileProject} from '../core/project.mjs';
import {compileTrack,cubicEase,springState} from '../core/tracks.mjs';
import {spring} from '../lib/motion.mjs';
import {synthesizeAudio} from '../scripts/audio.mjs';
import {sampleTimes} from '../scripts/render.mjs';
import {cubicPoint,pathGeometry} from '../core/geometry.mjs';
const raw=JSON.parse(await readFile(new URL('../examples/core-demo/project.json',import.meta.url),'utf8'));

test('bounded cubic easing handles flat derivatives and preserves exact endpoints',()=>{
  assert.ok(Math.abs(cubicEase(.001,[0,0,0,1])-.028)<1e-12);
  assert.ok(Math.abs(cubicEase(.999,[1,0,1,1])-.972)<1e-12);
  assert.ok(Math.abs(cubicEase(.501,[1,0,0,1])-.5939940787)<1e-8);
  for(const p of [[0,0,0,1],[1,0,1,1],[.25,-.5,.75,1.5]]){assert.equal(cubicEase(0,p),0);assert.equal(cubicEase(1,p),1);}
  assert.throws(()=>cubicEase(NaN,[0,0,1,1]));assert.throws(()=>cubicEase(.5,[2,0,1,1]));
});
test('analytic state agrees with legacy unit spring and satisfies arbitrary initial-state ODE',()=>{
  for(const z of [.4,1,1.7]) {
    const options={frequencyHz:2.2,dampingRatio:z},w=2*Math.PI*options.frequencyHz;
    for(const t of [0,.08,.24,.9])assert.ok(Math.abs(springState(t,0,0,1,options).value-spring(t,options))<1e-12);
    assert.deepEqual(springState(0,3,-5,12,options),{value:3,velocity:-5});
    const t=.231,h=1e-5,s=springState(t,3,-5,12,options),prev=springState(t-h,3,-5,12,options),next=springState(t+h,3,-5,12,options);
    assert.ok(Math.abs((next.value-prev.value)/(2*h)-s.velocity)<1e-5);
    assert.ok(Math.abs((next.velocity-prev.velocity)/(2*h)+2*z*w*s.velocity+w*w*(s.value-12))<1e-4);
  }
});
test('retarget changes frequency and damping while preserving position and velocity',()=>{
  const track=compileTrack({spring:{initial:2,velocity:3,frequencyHz:1.4,dampingRatio:.5,targets:[{at:0,value:9},{at:.24,value:-2,frequencyHz:3,dampingRatio:1.7},{at:.5,value:1,dampingRatio:1}]}},x=>x);
  for(const t of [.24,.5]){const h=1e-8,a=track.state(t-h),b=track.state(t+h);assert.ok(Math.abs(a.value-b.value)<1e-5);assert.ok(Math.abs(a.velocity-b.velocity)<1e-4);}
  const values=[.1,.8,.24,.5,1].map(t=>track(t));[1,.1,0,.8].forEach(track);assert.deepEqual([.1,.8,.24,.5,1].map(t=>track(t)),values);
});
test('single descriptor binds scenes, cuts, audio, QA and retiming in beats/frames/seconds',()=>{
  const film=compileFilm(raw),project=compileProject(raw);assert.deepEqual(project,film.project);assert.deepEqual(film.cuts,[3.5,6.5]);
  assert.equal(film.sample(3.5).sceneId,'contact');assert.equal(film.sample(6.5).sceneId,'shelter');assert.equal(film.sample(10).sceneId,'shelter');
  assert.equal(film.sample(-1).time,0);assert.equal(film.sample(20).time,10);assert.throws(()=>film.sample(NaN));
  for(const cut of film.cuts){assert.ok(sampleTimes(cut,project,8,1).every(t=>t>=cut));assert.ok(sampleTimes(cut-1/project.fps,project,8,1).every(t=>t<cut));}
  const audio=synthesizeAudio(project),contact=film.cues.find(c=>c.id==='contact');
  assert.equal(audio.stats.cues.find(c=>c.id==='contact').startSample,contact.at*48000);assert.equal(film.qa.find(q=>q.id==='contact').at,contact.at);
  const retimed=structuredClone(raw);retimed.cues.find(c=>c.id==='contact').at={frame:123};const other=compileFilm(retimed);
  assert.equal(other.qa.find(q=>q.id==='contact').at,4.1);assert.equal(synthesizeAudio(other.project).stats.cues.find(c=>c.id==='contact').startSample,196800);
  assert.equal(raw.cues.find(c=>c.id==='contact').at.frame,120);
});
test('pure frame state, persistent identity, camera log zoom and geometry endpoints',()=>{
  const film=compileFilm(raw),times=[0,2.01,3.5,4,4.7,6.5,8,10],frames=times.map(film.sample);
  for(const t of times.toReversed())film.sample(t);assert.deepEqual(times.map(film.sample),frames);
  assert.ok(Object.isFrozen(frames[4].objects[0].transform));assert.throws(()=>{frames[0].camera.x=1;});
  assert.deepEqual(frames[0].objects.map(o=>o.id),frames.at(-1).objects.map(o=>o.id));
  assert.notDeepEqual(film.sample(2.001).objects.find(o=>o.id==='seed').transform,film.sample(2.002).objects.find(o=>o.id==='seed').transform);
  const zoom=compileTrack({keys:[{at:0,value:1},{at:2,value:4,ease:'linear'}]},x=>x,{log:true});assert.equal(zoom(1),2);
  const points=[[2,4],[8,9],[12,10],[20,2]];assert.deepEqual([cubicPoint(points,0).x,cubicPoint(points,0).y],[2,4]);assert.deepEqual([cubicPoint(points,1).x,cubicPoint(points,1).y],[20,2]);
  assert.throws(()=>pathGeometry({type:'path',commands:[['C',0,0,1,1,2,2]]}));
});
test('compiler rejects parallel timing, missing IDs, bad geometry and gaps early',()=>{
  const bad=edit=>{const p=structuredClone(raw);edit(p);assert.throws(()=>compileFilm(p));};
  bad(p=>p.cuts=[3.5]);bad(p=>p.scenes[1].start=3.4);bad(p=>p.objects[1].id=p.objects[0].id);
  bad(p=>p.scenes[0].objects=['missing']);bad(p=>p.cues[1].at={beat:1,frame:2});bad(p=>p.scenes[0].camera.zoom=0);
  bad(p=>p.objects[0].x={keys:[{at:2,value:1},{at:1,value:2}]});bad(p=>p.objects[0].geometry.commands=[['M',0,NaN]]);
});
test('silent films produce finite measurements and correctly sized silent PCM',()=>{
  const silent=structuredClone(raw);silent.cues.forEach(c=>delete c.sound);
  const result=synthesizeAudio(compileFilm(silent).project);assert.equal(result.stats.peak,0);assert.equal(result.stats.rms,0);assert.equal(result.stats.peakDbFS,null);assert.equal(result.stats.normalizationGain,1);assert.equal(result.buffer.length,44+10*48000*4);assert.ok(result.buffer.subarray(44).every(v=>v===0));
});
test('canonical seconds survive non-grid BPM at a half-audio-sample boundary',()=>{
  for(const sample of [192003.5,192017.5]) {
    const p=structuredClone(raw);p.bpm=123;p.cues.find(c=>c.id==='contact').at={seconds:sample/48000};
    const film=compileFilm(p),at=sample/48000;
    assert.equal(film.cues.find(c=>c.id==='contact').at,at);assert.equal(film.project.events.find(c=>c.id==='contact').at,at);assert.equal(film.qa.find(c=>c.id==='contact').at,at);
    assert.equal(synthesizeAudio(film.project).stats.cues.find(c=>c.id==='contact').startSample,Math.round(at*48000));
  }
});
