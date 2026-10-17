import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyCore} from '../scripts/core-verify.mjs';
test('Canvas and SVG preserve shared state, order independence, reset and isolated masks',{skip:process.env.RENDER_INTEGRATION!=='1',timeout:120000},async()=>{
  const result=await verifyCore({scale:.125,compact:true,write:false});assert.equal(result.sharedFrameState,true);assert.equal(result.svgClipIsolation,true);assert.deepEqual(result.errors,[]);
});
