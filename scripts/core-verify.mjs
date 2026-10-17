import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve,repositoryRoot} from './serve.mjs';
import {compileFilm} from '../core/film.mjs';
const digest=value=>createHash('sha256').update(value).digest('hex');

export async function verifyCore({scale=.25,compact=false,write=true}={}) {
  const rawText=await readFile(path.join(repositoryRoot,'examples/core-demo/project.json'),'utf8'),film=compileFilm(JSON.parse(rawText)),p=film.project;
  const last=(p.frameCount-1)/p.fps;
  const times=[...new Set(compact?[.6,2.001,2.002,3.5,4,4.7,6.5,8.5,last]:[0,.6,2.001,2.002,...film.qa.flatMap(q=>[Math.max(0,q.at-1/p.fps),Math.min(last,q.at),Math.min(last,q.at+1/p.fps)]),...film.cuts,last])].sort((a,b)=>a-b);
  let server,browser;const errors=[],adapters={},states=new Map();
  try {
    server=await serve({port:0});browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined,args:['--force-color-profile=srgb']});
    async function open(kind,size=scale) {
      const page=await browser.newPage({viewport:{width:Math.round(p.width*size),height:Math.round(p.height*size)},deviceScaleFactor:1});
      page.setDefaultTimeout(30000);
      page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));
      page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
      await page.route('**/*',route=>new URL(route.request().url()).origin===server.url?route.continue():(errors.push('external resource'),route.abort()));
      await page.goto(`${server.url}/examples/core-demo/index.html?capture=1&adapter=${kind}&scale=${size}`,{waitUntil:'networkidle'});
      await page.waitForFunction(()=>Boolean(window.__motionReady)&&typeof window.seek==='function');
      await page.evaluate(async()=>{
        let timer;try {await Promise.race([Promise.all([window.__motionReady,document.fonts.ready]),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('core readiness/fonts timed out')),15000);})]);}finally{clearTimeout(timer);}
      });return page;
    }
    async function probe(page,t) {
      const state=await page.evaluate(t=>{const frame=window.seek(t);return {...frame,grain:{...frame.grain,path:undefined}};},t);
      const png=await page.locator('#film').screenshot({animations:'disabled'});
      return {time:t,pixels:digest(png),state:digest(JSON.stringify(state)),sceneId:state.sceneId,bounds:state.objects.map(o=>({id:o.id,...o.bounds}))};
    }
    for(const kind of ['canvas','svg']) {
      const page=await open(kind),reference=new Map();
      for(const t of times){const observed=await probe(page,t);reference.set(t,observed);if(kind==='canvas')states.set(t,observed.state);else if(states.get(t)!==observed.state)throw Error(`adapter frame state differs at ${t}`);}
      const orders=[['reverse',[...times].reverse()],['shuffle',[...times].sort((a,b)=>Math.sin(a*19)-Math.sin(b*19))],['repeat',times]];
      for(const [order,sequence] of orders)for(const t of sequence){const observed=await probe(page,t);if(observed.pixels!==reference.get(t).pixels||observed.state!==reference.get(t).state)throw Error(`${kind}/${order} differs at ${t}`);}
      const fresh=await open(kind);for(const t of times)if((await probe(fresh,t)).pixels!==reference.get(t).pixels)throw Error(`${kind}/fresh differs at ${t}`);await fresh.close();
      // Adapters must also remove contamination originating outside the scene.
      const dirty=times.at(-1);
      await page.evaluate(()=>{const root=document.querySelector('#film');root.style.cssText='filter:blur(8px);display:none;transform:translateX(100px);transform-origin:0 0';if(root.tagName==='CANVAS'){const c=root.getContext('2d');c.globalAlpha=.2;c.filter='blur(6px)';c.rect(0,0,5,5);c.clip();}else{root.setAttribute('opacity','.1');root.querySelector('[data-object]')?.setAttribute('display','none');}});
      if((await probe(page,dirty)).pixels!==reference.get(dirty).pixels)throw Error(`${kind} stale state not reset`);
      const other=await open(kind,scale*.8);await probe(other,dirty);await other.close();
      if((await probe(page,dirty)).pixels!==reference.get(dirty).pixels)throw Error(`${kind} size contamination`);
      if(reference.get(2.001).pixels===reference.get(2.002).pixels)throw Error(`${kind} subframes quantized`);
      if(kind==='svg') {
        const isolated=await page.evaluate(async()=>{
          const {svgAdapter}=await import('/core/adapters.mjs');
          const second=document.createElementNS('http://www.w3.org/2000/svg','svg');second.id='second-film';document.body.append(second);
          const frame=structuredClone(window.film.sample(4));frame.objects.find(o=>o.id==='seed').mask=[['M',0,0],['L',1920,0],['L',1920,500],['L',0,500],['Z']];
          svgAdapter(second,{scale:.1}).render(frame);
          const ids=[...document.querySelectorAll('clipPath')].map(e=>e.id);const unique=new Set(ids).size===ids.length;second.remove();return unique;
        });if(!isolated)throw Error('SVG clip IDs collide across instances');
      }
      adapters[kind]={probes:times.length,orders:['forward','reverse','shuffle','repeat','fresh'],staleStateReset:true,otherSizeIsolation:true,continuousSubframes:true,results:[...reference.values()]};await page.close();
    }
    if(errors.length)throw Error(errors.join('\n'));
    const report={project:p.id,projectSha256:digest(rawText),browser:browser.version(),node:process.version,scale,adapters,sharedFrameState:true,sharedBounds:true,svgClipIsolation:true,errors,limits:'PNG equality within each adapter/browser; cross-adapter pixels are not asserted. Bounds are conservative control hulls without stroke or clipping. Sampled probes are not a universal purity proof.'};
    if(write){await mkdir(path.join(repositoryRoot,'out'),{recursive:true});await writeFile(path.join(repositoryRoot,'out/core-verify.json'),JSON.stringify(report,null,2)+'\n');}
    return report;
  } finally {await browser?.close();await server?.close();}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {const report=await verifyCore();console.log(`Core: ${report.adapters.canvas.probes} poses × 2 adapters × 5 orders; state/bounds equal, reset/isolation passed. out/core-verify.json`);}catch(e){console.error(e);process.exitCode=1;}
}
