import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {serve,repositoryRoot} from './serve.mjs';
import {compileProject} from '../lib/project.mjs';

// All RGBA bytes are hashed. These are sampled regressions, not a proof for all t.
export async function verify({scale=.25}={}) {
  const raw=await readFile(path.join(repositoryRoot,'project.json'),'utf8'),project=compileProject(JSON.parse(raw));
  const fps=project.fps, last=(project.frameCount-1)/fps;
  const times=[...new Set([0,1.234,1.235,...project.events.flatMap(e=>[Math.max(0,e.at-1/fps),e.at,Math.min(last,e.at+1/fps)]),last])].sort((a,b)=>a-b);
  let local,browser;
  const errors=[],results=[];
  try {
    local=await serve({port:0});
    browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined,args:['--force-color-profile=srgb']});
    async function open(size){
      const page=await browser.newPage({viewport:{width:Math.round(project.width*size),height:Math.round(project.height*size)},deviceScaleFactor:1});
      page.on('pageerror',e=>errors.push(e.message));
      page.on('requestfailed',r=>errors.push(`${r.url()}: ${r.failure()?.errorText}`));
      await page.route('**/*',route=>{
        if(new URL(route.request().url()).origin!==local.url){errors.push(`external asset: ${route.request().url()}`);return route.abort();}
        return route.continue();
      });
      await page.goto(`${local.url}/examples/signal.html?capture=1&scale=${size}`,{waitUntil:'networkidle'});
      await page.waitForFunction(()=>typeof window.seek==='function');
      await page.evaluate(async()=>{await Promise.race([window.__motionReady,new Promise((_,bad)=>setTimeout(()=>bad(Error('readiness timed out')),15000))]);await document.fonts.ready;});
      return page;
    }
    async function pixels(page,t){
      const frame=await page.evaluate(t=>{
        const state=window.seek(t),canvas=document.querySelector('#film');
        if(!state||state.time!==t)throw Error('seek return time differs');
        const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
        // Chunked conversion avoids spreading a megapixel array on the JS stack.
        let binary='';for(let i=0;i<pixels.length;i+=16384)binary+=String.fromCharCode(...pixels.subarray(i,i+16384));
        return {base64:btoa(binary),state,width:canvas.width,height:canvas.height};
      },t);
      return {...frame,base64:undefined,hash:createHash('sha256').update(Buffer.from(frame.base64,'base64')).digest('hex')};
    }
    const page=await open(scale),reference=new Map();
    for(const t of times)reference.set(t,await pixels(page,t));
    const shuffled=[...times].sort((a,b)=>Math.sin(a*173+.7)-Math.sin(b*173+.7));
    for(const [name,order] of [['reverse',[...times].reverse()],['shuffled',shuffled],['repeat',times]]){
      for(const t of order){const observed=await pixels(page,t);if(observed.hash!==reference.get(t).hash)throw Error(`${name}: different pixels at ${t}s`);}
      results.push({order:name,probes:order.length,equal:true});
    }
    const other=await open(scale*.8);await pixels(other,last);await other.close();
    for(const t of times)if((await pixels(page,t)).hash!==reference.get(t).hash)throw Error('size contamination');
    results.push({order:'after other-size page',probes:times.length,equal:true});
    const fresh=await open(scale);
    for(const t of times)if((await pixels(fresh,t)).hash!==reference.get(t).hash)throw Error(`fresh page: ${t}`);
    results.push({order:'fresh page',probes:times.length,equal:true});
    if(reference.get(1.234).hash===reference.get(1.235).hash)throw Error('continuous subframe probes unexpectedly identical');
    if(errors.length)throw Error(errors.join('\n'));
    const report={project:project.id,projectSha256:createHash('sha256').update(raw).digest('hex'),browser:browser.version(),node:process.version,platform:process.platform,scale,algorithm:'SHA-256 of every RGBA byte',results,continuousSubframeDifference:true,errors,probes:[...reference.values()],limits:'Sampled times in one browser/platform; no universal proof or cross-platform pixel identity.'};
    await mkdir(path.join(repositoryRoot,'out'),{recursive:true});
    await writeFile(path.join(repositoryRoot,'out/verify.json'),JSON.stringify(report,null,2)+'\n');
    console.log(`${results.length} orders × ${times.length} probes equal; subframes distinct; no external assets. out/verify.json`);
    return report;
  } finally {await browser?.close();await local?.close();}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{await verify();}catch(error){console.error(error);process.exitCode=1;}
}
