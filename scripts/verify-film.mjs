import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve, repositoryRoot} from './serve.mjs';
import {compileFilm} from '../core/film.mjs';

const digest = value => createHash('sha256').update(value).digest('hex');
const options = {scale: .25, timeout: 30000};
for (const arg of process.argv.slice(2)) {
  const match = /^--(project|out|scale|timeout|chrome)=(.+)$/.exec(arg);
  if (!match) throw Error(`Unknown option: ${arg}`);
  options[match[1]] = match[2];
}
if (!options.project || !options.out) throw Error('Required: --project=examples/film/project.json --out=out/film/verify.json');
options.scale = Number(options.scale); options.timeout = Number(options.timeout);
if (!(options.scale > 0 && options.scale <= 2) || !(options.timeout > 0 && options.timeout <= 120000)) throw Error('Invalid scale or timeout.');
const projectPath = path.resolve(repositoryRoot, options.project);
const projectRelative = path.relative(repositoryRoot, projectPath).replaceAll('\\', '/');
if (projectRelative.startsWith('../') || path.isAbsolute(projectRelative)) throw Error('Descriptor must be inside this repository.');
const source = await readFile(projectPath, 'utf8');
const film = compileFilm(JSON.parse(source)), p = film.project;
const last = (p.frameCount - 1) / p.fps;
const clamp = t => Math.max(0, Math.min(p.duration, t));
const times = new Set([0, last, p.duration]);
for (const t of [...film.qa.map(q => q.at), ...film.cuts]) for (const delta of [-1 / p.fps, 0, 1 / p.fps]) times.add(clamp(t + delta));

// Pick substantial visible motion inside a single output frame and boil tick.
// The transform check only selects probes: the actual assertion uses all RGBA bytes.
const motion = frame => ({camera: frame.camera, transition: frame.transition, objects: frame.objects.filter(o => o.visible).map(o => ({id:o.id, transform:o.transform, opacity:o.opacity}))});
function movement(a, b) {
  if (a.sceneId !== b.sceneId) return 0;
  const aa=motion(a), bb=motion(b);
  if (JSON.stringify(aa) === JSON.stringify(bb)) return 0;
  let score = Math.abs(aa.camera.x-bb.camera.x)+Math.abs(aa.camera.y-bb.camera.y)+Math.abs(aa.camera.zoom-bb.camera.zoom)*p.width;
  for (const object of aa.objects) {
    const other=bb.objects.find(o=>o.id===object.id); if (!other) continue;
    for (const channel of ['x','y','rotation']) score+=Math.abs(object.transform[channel]-other.transform[channel]);
    for (const channel of ['scaleX','scaleY']) score+=Math.abs(object.transform[channel]-other.transform[channel])*100;
    score+=Math.abs(object.opacity-other.opacity)*100;
  }
  return score;
}
const candidates=[];
for (let n=0;n<p.frameCount;n++) {
  const a=(n+.2)/p.fps,b=(n+.7)/p.fps;
  if (b>=p.duration || Math.floor(a*12)!==Math.floor(b*12)) continue;
  const fa=film.sample(a),fb=film.sample(b),score=movement(fa,fb);
  if (score>.01) candidates.push({a,b,score,scene:fa.sceneId});
}
const subframes=[];
for (const scene of new Set(candidates.map(c=>c.scene))) {
  for (const candidate of candidates.filter(c=>c.scene===scene).sort((a,b)=>b.score-a.score)) {
    if (subframes.filter(c=>c.scene===scene).length>=2) break;
    if (!subframes.some(c=>Math.abs(c.a-candidate.a)<.2)) subframes.push(candidate);
  }
}
for (const pair of subframes) {times.add(pair.a);times.add(pair.b);}
const sorted=[...times].sort((a,b)=>a-b);
const orders=[['forward',sorted],['reverse',[...sorted].reverse()],['shuffled',[...sorted.filter((_,i)=>i%2),...sorted.filter((_,i)=>!(i%2)).reverse()]],['repeat',sorted]];
let server,browser;
const errors=[],results={},sharedStates=new Map();
async function bounded(promise,label) {
  let timer;
  try {return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(`${label}: timeout after ${options.timeout}ms`)),options.timeout);})]);}
  finally {clearTimeout(timer);}
}
try {
  server=await serve({port:0});
  browser=await chromium.launch({headless:true,executablePath:options.chrome||process.env.CHROME_PATH||undefined,timeout:options.timeout,args:['--force-color-profile=srgb']});
  async function open(kind) {
    const page=await browser.newPage({viewport:{width:Math.round(p.width*options.scale),height:Math.round(p.height*options.scale)},deviceScaleFactor:1});
    const descriptors=[];
    page.setDefaultTimeout(options.timeout);page.setDefaultNavigationTimeout(options.timeout);
    page.on('pageerror',e=>errors.push(`JS: ${e.message}`));
    page.on('requestfailed',r=>errors.push(`Network: ${r.url()} ${r.failure()?.errorText}`));
    page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP ${r.status()}: ${r.url()}`);if(decodeURIComponent(new URL(r.url()).pathname)===`/${projectRelative}`){const body=r.body().then(bytes=>digest(bytes));body.catch(()=>{});descriptors.push(body);}});
    await page.route('**/*',route=>{
      if(new URL(route.request().url()).origin===server.url)return route.continue();
      errors.push(`External resource: ${route.request().url()}`);return route.abort();
    });
    const url=new URL('/examples/core-demo/index.html',server.url);
    url.search=new URLSearchParams({capture:'1',adapter:kind,scale:String(options.scale),project:`/${projectRelative}`});
    await page.goto(url.href,{waitUntil:'load'});
    await page.waitForFunction(()=>window.__motionReady && typeof window.seek==='function');
    await bounded(page.evaluate(async()=>{await window.__motionReady;await document.fonts.ready;}),'readiness/fonts');
    const descriptorHashes=await bounded(Promise.all(descriptors),'descriptor response');
    if(descriptorHashes.length!==1 || descriptorHashes[0]!==digest(source))throw Error(`Descriptor changed during verification (${kind}); rerun on a stable source.`);
    const loaded=await bounded(page.evaluate(()=>window.film.project),'project identity');
    if(digest(JSON.stringify(loaded))!==digest(JSON.stringify(p)))throw Error('Browser loaded a different descriptor.');
    return page;
  }
  async function probe(page,kind,t) {
    const value=await bounded(page.evaluate(async ({kind,t})=>{
      const frame=window.seek(t);
      if(!frame || frame.then || Math.abs(frame.time-t)>1e-9)throw Error('seek must synchronously return the requested frame.');
      const surface=document.querySelector('#film');
      const sha=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
      const state=await sha(new TextEncoder().encode(JSON.stringify(frame)));
      let pixels=null,byteLength=null;
      if(kind==='canvas') {
        // Read a dedicated CPU capture buffer, as the video renderer does.
        // Repeated getImageData on the scene surface can change Chrome's backing
        // mode from GPU to CPU and therefore change its antialiasing mid-run.
        const capture=document.createElement('canvas');capture.width=surface.width;capture.height=surface.height;
        const ctx=capture.getContext('2d',{willReadFrequently:true});ctx.drawImage(surface,0,0);
        const rgba=ctx.getImageData(0,0,capture.width,capture.height).data;
        byteLength=rgba.byteLength;
        pixels=await sha(rgba);
      }
      return {state,scene:frame.sceneId,pixels,byteLength,width:kind==='canvas'?surface.width:null,height:kind==='canvas'?surface.height:null,dom:kind==='svg'?await sha(new TextEncoder().encode(surface.outerHTML)):null};
    },{kind,t}),`${kind} seek ${t}`);
    const state=value.state;
    if(kind==='canvas' && !sharedStates.has(t))sharedStates.set(t,state);
    if(sharedStates.get(t)!==state)throw Error(`${kind}: shared browser frame state differs at ${t}`);
    if(kind==='canvas' && (value.width!==Math.round(p.width*options.scale)||value.height!==Math.round(p.height*options.scale)||value.byteLength!==value.width*value.height*4))throw Error('Incomplete or wrong-size RGBA read.');
    return {time:t,state,pixels:value.pixels,rgbaBytes:value.byteLength,dom:value.dom,scene:value.scene};
  }
  for (const kind of ['canvas','svg']) {
    const page=await open(kind),reference=new Map();
    for (const [order,sequence] of orders) for(const t of sequence) {
      const value=await probe(page,kind,t);
      if(order==='forward')reference.set(t,value);
      else if(JSON.stringify(value)!==JSON.stringify(reference.get(t)))throw Error(`${kind}/${order} differs at ${t}: ${JSON.stringify({reference:reference.get(t),observed:value})}`);
    }
    console.log(`${kind}: ${sorted.length} probes passed in forward/reverse/shuffled/repeat order.`);
    const fresh=await open(kind);
    for(const t of sorted)if(JSON.stringify(await probe(fresh,kind,t))!==JSON.stringify(reference.get(t)))throw Error(`${kind}/fresh differs at ${t}`);
    await fresh.close();await page.close();
    results[kind]={orders:[...orders.map(([name])=>name),'fresh'],probes:sorted.length,results:[...reference.values()]};
  }
  const canvas=new Map(results.canvas.results.map(r=>[r.time,r]));
  const subframeResults=subframes.map(pair=>({...pair,rgbaChanged:canvas.get(pair.a).pixels!==canvas.get(pair.b).pixels}));
  if(subframes.length && !subframeResults.some(pair=>pair.rgbaChanged))throw Error('Active subframes have no measured RGBA change at this scale; continuity was not verified.');
  if(errors.length)throw Error(errors.join('\n'));
  if(digest(await readFile(projectPath))!==digest(source))throw Error('Descriptor changed before verification completed; rerun on a stable source.');
  const report={project:p.id,projectPath:projectRelative,projectSha256:digest(source),browser:browser.version(),node:process.version,scale:options.scale,dimensions:[Math.round(p.width*options.scale),Math.round(p.height*options.scale)],qa:film.qa,cuts:film.cuts,subframes:subframeResults,adapters:results,errors,limits:'Full raw RGBA equality at sampled times in Canvas on this browser and scale. SVG checks complete DOM and shared browser frame state, not raster pixels. Node and browser floating-point transcendentals are not asserted bit-identical. These finite probes do not prove universal purity or visual intent. No audio listening or perceptual timing assessment is claimed.'};
  const output=path.resolve(repositoryRoot,options.out);await mkdir(path.dirname(output),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');
  console.log(`${p.id}: ${sorted.length} probes × 5 orders × 2 adapters; ${subframeResults.filter(p=>p.rgbaChanged).length}/${subframes.length} active subframe pairs changed RGBA. ${options.out}`);
} finally {
  try {if(browser)await bounded(browser.close(),'browser cleanup');}
  finally {if(server){server.server.closeAllConnections();await bounded(server.close(),'server cleanup');}}
}
