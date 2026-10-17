import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {pixelMetrics,parseCaseArgs,compare} from '../scripts/rea-case.mjs';
import {poseAt} from '../examples/rea-signal/reconstruction.mjs';
import {compileProject} from '../lib/project.mjs';

test('comparison detects a displaced colored pixel, preserves alpha exclusion and ROI scope',()=>{
  const a=Buffer.from([255,0,0,255, 0,0,0,255, 0,0,0,255]);
  const b=Buffer.from([0,0,0,255, 255,0,0,255, 0,0,0,1]);
  const metric=pixelMetrics(a,b,3,1);
  assert.equal(metric.mae,510/9);assert.equal(metric.rmse,Math.sqrt(2*255**2/9));assert.equal(metric.changedFraction,2/3);
  assert.equal(pixelMetrics(a,b,3,1,[2,0,1,1]).mae,0);
  assert.throws(()=>pixelMetrics(a,b,3,1,[3,0,1,1]),/ROI/);
  assert.throws(()=>pixelMetrics(a,b.subarray(0,8),3,1),/dimensions/);
});
test('case CLI rejects invalid phases and scales',()=>{
  assert.throws(()=>parseCaseArgs(['--phase=install']),/phase/);
  assert.throws(()=>parseCaseArgs(['--scale=NaN']),/scale/);
  assert.throws(()=>parseCaseArgs(['--scale=0']),/scale/);
});
test('reconstructed contact reaches target and motion remains subframe continuous',async()=>{
  const project=compileProject(JSON.parse(await readFile(new URL('../examples/rea-signal/project.json',import.meta.url),'utf8')));
  const spec=JSON.parse(await readFile(new URL('../examples/rea-signal/spec.json',import.meta.url),'utf8'));
  const contact=project.events.find(event=>event.id==='contact').at;
  const pose=poseAt(contact,project,spec);
  assert.ok(Math.hypot(...pose.signal.map((v,i)=>v-pose.center[i]))<1e-9);
  assert.notDeepEqual(poseAt(1.234,project,spec).signal,poseAt(1.235,project,spec).signal);
  assert.throws(()=>poseAt(NaN,project,spec),/finite/);
  assert.equal(poseAt(-1,project,spec).time,0);
  assert.equal(poseAt(100,project,spec).time,project.duration);
});
test('reconstructed browser case compares both pages and seeks in four orders', {skip:process.env.RENDER_INTEGRATION!=='1',timeout:120000},async()=>{
  const directory=await mkdtemp(path.join(os.tmpdir(),'codex-rea-case-'));
  try{
    const report=await compare({out:directory,scale:.125,chrome:process.env.CHROME_PATH});
    assert.equal(report.pass,true);assert.equal(report.determinism.length,8);
    assert.ok(report.measurements.length>=30);assert.deepEqual(report.errors,[]);
  }finally{
    const resolved=path.resolve(directory),temporary=path.resolve(os.tmpdir());
    assert.equal(path.dirname(resolved),temporary);assert.ok(path.basename(resolved).startsWith('codex-rea-case-'));
    await rm(resolved,{recursive:true,force:true});
  }
});
