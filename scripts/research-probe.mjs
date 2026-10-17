// Original audit harness. Upstream sources are read from caller-supplied clones,
// never copied into this repository. This runner uses Playwright, not REA.
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const targets = [
  {id:'howseen',directory:'claude-motion-design',commit:'3d90d349ef3fdde9b7e89de4df4a2159c9e8697f',files:{'/howseen/core.js':'skill/motion-design/scripts/remake/core.js'}},
  {id:'whaley',directory:'claude-motion',commit:'e627941543d9988b155dc610bb9cc0115a5e365e',files:{'/whaley/director.js':'sims/kit/director.js','/whaley/util.js':'sims/kit/util.js'}},
  {id:'mort',directory:'motion-graphics-skills',commit:'7f0c3714dc81bea52644a5287c6350345009e579',files:{'/mort/engine.js':'skills/motion-graphics/assets/template/js/engine.js'}},
];
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const scripts = {
  howseen: `
    await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/howseen/core.js';s.onload=resolve;s.onerror=()=>reject(Error('core load failed'));document.head.append(s);});
    SHOT({id:'audit',f0:0,f1:240,render:(_local,frame)=>String(frame)});
    const seconds=[0,.001,.01,.02,.021,.03,1,.01];
    const frames=seconds.map(t=>seek(t));const eps=1e-6;
    return {seconds,frames,rightVelocityPerSecond:CORE.spring(eps*24)/eps,overdampedFinite:Number.isFinite(CORE.spring(24,2.2,2))};`,
  whaley: `
    const {createDirector,DIRECTOR}=await import('/whaley/director.js');
    const director=createDirector(document.getElementById('app'),{duration:30,accent:'#c8795e',beats:null,stages:[],story:[],director:{...DIRECTOR,shots:[{z:2,f:0}],punch:[0,0],shake:0,flash:0,glitch:0}});
    const sequence=[0,5,10,5,5];const origins=sequence.map(t=>{director.pre(t);const origin=document.getElementById('gl').style.transformOrigin;director.post(t,{foci:[{x:100+10*t,y:150}]});return origin;});
    return {sequence,origins,scope:'Synthetic deterministic foci, original director; shipped examples disable director by default.'};`,
  mort: `
    const e=await import('/mort/engine.js');
    const cubicCases=[{points:[0,0,0,1],x:.001,expected:.028},{points:[1,0,1,1],x:.999,expected:.972},{points:[1,0,0,1],x:.501,expected:.5939940787421145}].map(c=>({...c,actual:e.bezier(...c.points)(c.x)}));
    const old=document.createElement('div'),fresh=document.createElement('div'),hidden=document.createElement('div');
    e.set(old,{x:9,vis:true,blur:8,origin:'0% 0%'});e.set(old,{x:0});e.set(fresh,{x:0});e.set(hidden,{vis:false});e.set(hidden,{x:0});
    return {cubicCases,spring:{time:.1,frequencyHz:3,critical:e.spring(.1,3,1),overdamped:e.spring(.1,3,2)},styles:{previous:{filter:old.style.filter,origin:old.style.transformOrigin},fresh:{filter:fresh.style.filter,origin:fresh.style.transformOrigin},hiddenDisplay:hidden.style.display}};`,
};
function harness(id) {
  return `<!doctype html><meta charset="utf-8"><title>Motion research: ${id}</title><div id="stage"></div><div id="app"><canvas id="gl" width="640" height="360"></canvas></div><pre id="result">running</pre><script type="module">try{window.auditResult=await(async()=>{${scripts[id]}})();document.getElementById('result').textContent=JSON.stringify(window.auditResult,null,2);window.auditDone=true;}catch(error){window.auditError=String(error.stack||error);document.getElementById('result').textContent=window.auditError;window.auditDone=true;}</script>`;
}

/** Serve only pre-read, commit-checked files and three original harnesses. */
export async function createResearchServer(sources) {
  const routes=new Map(),identity=[];
  for(const target of targets) {
    const directory=path.resolve(sources,target.directory);
    const head=execFileSync('git',['-C',directory,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
    if(head!==target.commit)throw Error(`${target.directory}: expected ${target.commit}, found ${head}`);
    const changed=execFileSync('git',['-C',directory,'status','--porcelain','--',...Object.values(target.files)],{encoding:'utf8'}).trim();
    if(changed)throw Error(`${target.directory}: selected source files have local changes`);
    const files=[];
    for(const [route,file] of Object.entries(target.files)) {const bytes=await readFile(path.join(directory,file));routes.set(route,{bytes,type:'text/javascript; charset=utf-8'});files.push({file,bytes:bytes.length,sha256:sha256(bytes)});}
    routes.set(`/probe/${target.id}`,{bytes:Buffer.from(harness(target.id)),type:'text/html; charset=utf-8'});
    identity.push({id:target.id,repository:target.directory,commit:head,files});
  }
  const server=createServer((req,res)=>{
    const pathname=new URL(req.url,'http://127.0.0.1').pathname;
    if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
    const route=routes.get(pathname);if(!route){res.writeHead(404).end('Not found');return;}
    res.writeHead(200,{'Content-Type':route.type,'Cache-Control':'no-store'});res.end(route.bytes);
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  return {url:`http://127.0.0.1:${server.address().port}`,identity,close:()=>new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()))};
}

function checkResults(results) {
  const h=results.howseen,w=results.whaley,m=results.mort;
  const checks={
    howseenQuantization:JSON.stringify(h.frames)==='[0,0,0,0,1,1,24,0]',
    howseenNonzeroInitialVelocity:Math.abs(h.rightVelocityPerSecond-7.6026919586524855)<1e-8,
    howseenOverdampedNonfinite:h.overdampedFinite===false,
    whaleyHistoryDependent:JSON.stringify(w.origins)===JSON.stringify(['320px 180px','100px 150px','150px 150px','200px 150px','150px 150px']),
    mortBezierMismatch:m.cubicCases.every(c=>Math.abs(c.actual-c.expected)>.01),
    mortOverdampedEqualsCritical:m.spring.overdamped===m.spring.critical,
    mortStylesPersist:m.styles.previous.filter==='blur(8px)'&&m.styles.previous.origin==='0% 0%'&&m.styles.fresh.filter===''&&m.styles.fresh.origin===''&&m.styles.hiddenDisplay==='none',
  };
  if(Object.values(checks).some(ok=>!ok))throw Error(`Frozen-source observations differ: ${JSON.stringify(checks)}`);
  return checks;
}

export async function runResearchProbes({sources,out='out/research/reproduction.json',holdMs=0}={}) {
  if(!sources)throw Error('--sources=<directory containing the audited clones> is required');
  if(!Number.isInteger(holdMs)||holdMs<0||holdMs>60000)throw Error('--hold-ms must be an integer from 0 to 60000');
  let server,browser;
  try {
    server=await createResearchServer(sources);
    console.log(`Audited harnesses: ${server.url}/probe/{howseen,whaley,mort}`);
    browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined});
    const results={};
    for(const target of targets) {
      const page=await browser.newPage({viewport:{width:640,height:360},deviceScaleFactor:1}),errors=[];
      try {
        page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));
        page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
        await page.route('**/*',route=>new URL(route.request().url()).origin===server.url?route.continue():(errors.push('external resource refused'),route.abort()));
        await page.goto(`${server.url}/probe/${target.id}`);
        await page.waitForFunction(()=>window.auditDone===true,null,{timeout:15000});
        const result=await page.evaluate(()=>({error:window.auditError,result:window.auditResult}));
        if(result.error||errors.length)throw Error(`${target.id}: ${[result.error,...errors].filter(Boolean).join('\n')}`);
        results[target.id]=result.result;
      } finally {await page.close();}
    }
    const checks=checkResults(results);
    const report={schema:1,tool:'Playwright; this runner does not call REA',browser:browser.version(),node:process.version,viewport:[640,360],dpr:1,sources:server.identity,results,checks,scope:'Kernel observations at frozen commits. No commercial material, assets, full-film export or universal determinism proof.'};
    await mkdir(path.dirname(path.resolve(out)),{recursive:true});await writeFile(out,JSON.stringify(report,null,2)+'\n');
    console.log(`Reproduced ${Object.keys(checks).length} expected upstream observations -> ${out}`);
    if(holdMs){console.log(`Harness server stays available for ${holdMs} ms for an optional separate REA scenario.`);await new Promise(resolve=>setTimeout(resolve,holdMs));}
    return report;
  } finally {try{await browser?.close();}finally{await server?.close();}}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const values=Object.fromEntries(process.argv.slice(2).map(arg=>{const match=/^--(sources|out|hold-ms)=(.+)$/.exec(arg);if(!match)throw Error(`unknown argument: ${arg}`);return [match[1],match[2]];}));
  try{await runResearchProbes({sources:values.sources,out:values.out,holdMs:values['hold-ms']===undefined?0:Number(values['hold-ms'])});}catch(error){console.error(error.message);process.exitCode=1;}
}
