import test from 'node:test';
import assert from 'node:assert/strict';
import {spring, springTrack, dampingRatio, hash, progress} from '../lib/motion.mjs';

test('springs satisfy initial conditions, ODE and settling in three regimes', () => {
  for(const z of [.45, .8, 1, 1.4, 3]) {
    const options={frequencyHz:2.3,dampingRatio:z}, w=2*Math.PI*options.frequencyHz;
    assert.equal(spring(-2,options),0);assert.equal(spring(0,options),0);
    assert.ok(Math.abs(spring(1e-7,options)/1e-7)<.001,'starts at rest');
    assert.ok(Math.abs(spring(1e-7,{...options,initialVelocity:2})/1e-7-2)<.001);
    for(const t of [.081,.24,.51]) {
      const h=1e-5,x=spring(t,options), v=(spring(t+h,options)-spring(t-h,options))/(2*h);
      const a=(spring(t+h,options)-2*x+spring(t-h,options))/(h*h);
      assert.ok(Math.abs(a+2*z*w*v+w*w*x-w*w)<.002,`ODE at zeta=${z}, t=${t}`);
    }
    assert.ok(Math.abs(spring(10,options)-1)<1e-8);
    if(z>=1) for(let i=0;i<100;i++) assert.ok(spring(i/100,options)<=spring((i+1)/100,options)+1e-12);
  }
  assert.notEqual(spring(.2,{dampingRatio:1}),spring(.2,{dampingRatio:2}));
  for(const args of [[NaN,{}],[1,{frequencyHz:0}],[1,{dampingRatio:-1}]]) assert.throws(()=>spring(...args));
});

test('target changes preserve position and velocity at the retarget', () => {
  const changes=[{at:0,value:1},{at:.7,value:-.5}],h=1e-6;
  const f=t=>springTrack(t,0,changes,{frequencyHz:2,dampingRatio:.8});
  assert.ok(Math.abs(f(.7+h)-f(.7-h))<1e-5);
  const before=(f(.7)-f(.7-h))/h,after=(f(.7+h)-f(.7))/h;
  assert.ok(Math.abs(before-after)<.001);
  assert.ok(Math.abs(f(10)+.5)<1e-9);
  assert.throws(()=>springTrack(1,0,[{at:1,value:1},{at:0,value:2}]));
  assert.throws(()=>springTrack(1,0,changes,{initialVelocity:1}),/at rest/);
});

test('units, stateless variation and progress are explicit', () => {
  assert.equal(dampingRatio({mass:1,stiffness:100,damping:20}),1);
  assert.equal(hash(17,'petal'),hash(17,'petal'));
  assert.notEqual(hash(17,'petal'),hash(18,'petal'));
  assert.equal(progress(8,1,2),1);assert.throws(()=>progress(1,1,1));
});
