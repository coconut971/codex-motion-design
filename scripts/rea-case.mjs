import {readFile, writeFile, mkdir, access} from 'node:fs/promises';
import {createHash, randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {serve, repositoryRoot} from './serve.mjs';
import {compileProject} from '../lib/project.mjs';
import {render, parseArgs as renderArgs} from './render.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = async (file, value) => writeFile(file, JSON.stringify(value,null,2)+'\n');
async function bounded(promise,label,ms=30000){
  let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(`${label} timed out`)),ms);})]);}finally{clearTimeout(timer);}
}
export function parseCaseArgs(args) {
  const options={phase:'all',out:'out/rea-case',scale:.5,overwrite:false};
  for(const arg of args){
    if(arg==='--overwrite'){options.overwrite=true;continue;}
    const m=/^--(phase|out|scale|chrome|ffmpeg|npm-cli)=(.+)$/.exec(arg);
    if(!m)throw Error(`Unknown option: ${arg}`);
    options[m[1]]=m[2];
  }
  options.scale=Number(options.scale);
  if(!['all','investigate','compare','render'].includes(options.phase))throw Error('Invalid phase');
  if(!(options.scale>0&&options.scale<=1))throw Error('Expected 0 < scale <= 1');
  return options;
}
function execute(command,args,timeout=180000){
  return new Promise((resolve,reject)=>{
    const child=spawn(command,args,{cwd:repositoryRoot,windowsHide:true,stdio:['ignore','pipe','pipe']});
    const stdout=[],stderr=[];
    const timer=setTimeout(()=>{
      // Windows does not propagate a kill to npm's REA child. Terminate only
      // this owned process tree and reject even if a descendant retained a pipe.
      if(process.platform==='win32'&&child.pid){
        const killer=spawn('taskkill.exe',['/pid',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});
        killer.once('error',()=>child.kill());
      }else child.kill('SIGKILL');
      reject(Error(`${command} timed out after ${timeout} ms`));
    },timeout);
    child.stdout.on('data',data=>stdout.push(data));child.stderr.on('data',data=>stderr.push(data));
    child.once('error',error=>{clearTimeout(timer);reject(error);});
    child.once('close',code=>{clearTimeout(timer);const result={code,stdout:Buffer.concat(stdout).toString('utf8'),stderr:Buffer.concat(stderr).toString('utf8')};if(code!==0)reject(Error(`${command} exited ${code}: ${result.stderr}\n${result.stdout.slice(0,1000)}`));else resolve(result);});
  });
}
async function npmCli(options){
  const candidates=[options['npm-cli'],process.env.npm_execpath,path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'),path.resolve(path.dirname(process.execPath),'../lib/node_modules/npm/bin/npm-cli.js')].filter(Boolean);
  for(const candidate of candidates)try{await access(candidate);return candidate;}catch{}
  throw Error('npm CLI unavailable; pass --npm-cli=/absolute/path/to/npm-cli.js');
}
async function freePort(){
  const server=net.createServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port;await new Promise(resolve=>server.close(resolve));return port;
}
async function pageAt(browser,local,html,scale,project,errors){
  const page=await browser.newPage({viewport:{width:Math.round(project.width*scale),height:Math.round(project.height*scale)},deviceScaleFactor:1});
  page.on('pageerror',error=>errors.push(error.message));
  page.on('requestfailed',request=>errors.push(request.url()+': '+request.failure()?.errorText));
  page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
  await page.route('**/*',route=>new URL(route.request().url()).origin===local.url?route.continue():route.abort());
  await page.goto(`${local.url}${html}?capture=1&scale=${scale}`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>typeof window.seek==='function'&&!!window.__motionReady);
  await bounded(page.evaluate(async()=>{await window.__motionReady;await document.fonts.ready;}),'readiness/fonts');
  return page;
}
async function pixels(page,time){
  const frame=await bounded(page.evaluate(time=>{
    const state=window.seek(time),canvas=document.querySelector('#film');
    const data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
    let bytes='';for(let i=0;i<data.length;i+=16384)bytes+=String.fromCharCode(...data.subarray(i,i+16384));
    return {state,rgba:btoa(bytes),png:canvas.toDataURL('image/png').split(',')[1],width:canvas.width,height:canvas.height};
  },time),'Canvas capture');
  return {...frame,rgba:Buffer.from(frame.rgba,'base64'),png:Buffer.from(frame.png,'base64')};
}

/** RGB units are byte levels (0..255), alpha is deliberately excluded. */
export function pixelMetrics(a,b,width,height,roi=[0,0,width,height],threshold=12){
  if(a.length!==b.length||a.length!==width*height*4)throw Error('RGBA dimensions differ');
  const [x,y,w,h]=roi;
  if(![x,y,w,h].every(Number.isInteger)||x<0||y<0||w<=0||h<=0||x+w>width||y+h>height)throw Error('Invalid metric ROI');
  let absolute=0,squared=0,changed=0,max=0;
  for(let row=y;row<y+h;row++)for(let col=x;col<x+w;col++){
    const offset=(row*width+col)*4;let largest=0;
    for(let channel=0;channel<3;channel++){const delta=Math.abs(a[offset+channel]-b[offset+channel]);absolute+=delta;squared+=delta*delta;largest=Math.max(largest,delta);}
    if(largest>threshold)changed++;max=Math.max(max,largest);
  }
  return {mae:absolute/(w*h*3),rmse:Math.sqrt(squared/(w*h*3)),changedFraction:changed/(w*h),maximumChannelDifference:max,pixels:w*h};
}
export function withinThresholds(row,threshold){
  return row.full.mae<=threshold.maxFullMAE&&row.full.rmse<=threshold.maxFullRMSE&&row.roi.mae<=threshold.maxRoiMAE&&row.roi.rmse<=threshold.maxRoiRMSE&&row.roi.changedFraction<=threshold.maxChangedFraction;
}
export function comparisonTimes(project){
  const last=(project.frameCount-1)/project.fps,contact=project.events.find(event=>event.id==='contact').at;
  const times=[0,1.234,1.235,last,...project.events.flatMap(event=>[event.at-1/project.fps,event.at,event.at+1/project.fps])];
  for(let t=0;t<project.duration;t+=60/project.bpm)times.push(t);
  for(let frame=-6;frame<=6;frame++)times.push(contact+frame/project.fps);
  return [...new Set(times.filter(time=>time>=0&&time<=last).map(time=>Number(time.toFixed(9))))].sort((a,b)=>a-b);
}
async function sheet(page,rows,file,{crop=null,thumbWidth=320,title='Source | Reconstruction | Difference RGB ×4'}={}){
  const png=await bounded(page.evaluate(async({rows,crop,thumbWidth,title})=>{
    const load=base64=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src='data:image/png;base64,'+base64;});
    const first=await load(rows[0].source),area=crop??[0,0,first.width,first.height];
    const cellHeight=Math.round(thumbWidth*area[3]/area[2]),header=32,rowHeight=cellHeight+26;
    const canvas=document.createElement('canvas');canvas.width=thumbWidth*3;canvas.height=header+rowHeight*rows.length;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#F1E8D7';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#2E3C50';ctx.font='14px sans-serif';ctx.fillText(title,8,21);
    for(let row=0;row<rows.length;row++){
      const a=await load(rows[row].source),b=await load(rows[row].reconstruction);
      const diff=document.createElement('canvas');diff.width=a.width;diff.height=a.height;const dc=diff.getContext('2d');
      dc.drawImage(a,0,0);const ap=dc.getImageData(0,0,a.width,a.height);dc.clearRect(0,0,a.width,a.height);dc.drawImage(b,0,0);const bp=dc.getImageData(0,0,a.width,a.height);
      for(let i=0;i<ap.data.length;i+=4){for(let c=0;c<3;c++)ap.data[i+c]=Math.min(255,Math.abs(ap.data[i+c]-bp.data[i+c])*4);ap.data[i+3]=255;}dc.putImageData(ap,0,0);
      const top=header+row*rowHeight;ctx.fillStyle='#2E3C50';ctx.fillText(`t=${rows[row].time.toFixed(4)} s`,8,top+18);
      for(const [col,image] of [a,b,diff].entries())ctx.drawImage(image,...area,col*thumbWidth,top+26,thumbWidth,cellHeight);
    }
    return canvas.toDataURL('image/png').split(',')[1];
  },{rows,crop,thumbWidth,title}),'comparison sheet',60000);
  await writeFile(file,Buffer.from(png,'base64'));
}
export async function compare(options){
  const out=path.resolve(repositoryRoot,options.out),spec=JSON.parse(await readFile(path.join(repositoryRoot,'examples/rea-signal/spec.json'),'utf8'));
  const descriptor=await readFile(path.join(repositoryRoot,'examples/rea-signal/project.json'),'utf8'),project=compileProject(JSON.parse(descriptor));
  const sourceRaw=await readFile(path.join(repositoryRoot,'project.json'),'utf8'),source=compileProject(JSON.parse(sourceRaw));
  if(sha(sourceRaw)!==spec.source.projectSha256||sha(await readFile(path.join(repositoryRoot,'examples/signal.mjs')))!==spec.source.moduleSha256)throw Error('Reference changed since frozen spec; investigate and review spec before comparison.');
  for(const [file,expected] of Object.entries(spec.source.dependencySha256)){
    if(sha(await readFile(path.join(repositoryRoot,file)))!==expected)throw Error(`Reference dependency changed since frozen spec: ${file}; investigate and review spec.`);
  }
  const {id:sourceId,...sourceData}=source,{id:projectId,...reconstructionData}=project;
  if(JSON.stringify(sourceData)!==JSON.stringify(reconstructionData))throw Error('Comparison requires identical dimensions, seed, timing, palette and sound data.');
  await mkdir(path.join(out,'frames'),{recursive:true});
  if(!options.overwrite)try{await access(path.join(out,'metrics.json'));throw Error('Comparison exists; use --overwrite');}catch(error){if(error.code!=='ENOENT')throw error;}
  const errors=[],times=comparisonTimes(project),rows=[],measurements=[],determinism=[],refs={source:new Map(),reconstruction:new Map()};let local,browser;
  try{
    local=await serve({port:0});browser=await chromium.launch({headless:true,executablePath:options.chrome||process.env.CHROME_PATH||undefined,args:['--force-color-profile=srgb']});
    const pages={source:await pageAt(browser,local,'/examples/signal.html',options.scale,source,errors),reconstruction:await pageAt(browser,local,'/examples/rea-signal/index.html',options.scale,project,errors)};
    const inBrowser=await pages.reconstruction.evaluate(()=>window.film.project);if(JSON.stringify(inBrowser)!==JSON.stringify(project))throw Error('Reconstruction HTML/project pair mismatch');
    for(const time of times){
      const a=await pixels(pages.source,time),b=await pixels(pages.reconstruction,time),roi=spec.comparison.roiLogical.map(value=>Math.round(value*options.scale));
      if(a.width!==b.width||a.height!==b.height)throw Error('Capture size mismatch');
      const name=time.toFixed(4).replace('.','-');
      for(const [kind,frame] of [['source',a],['reconstruction',b]]){refs[kind].set(time,sha(frame.rgba));await writeFile(path.join(out,'frames',`${name}-${kind}.png`),frame.png);}
      rows.push({time,source:a.png.toString('base64'),reconstruction:b.png.toString('base64')});
      measurements.push({time,full:pixelMetrics(a.rgba,b.rgba,a.width,a.height,undefined,spec.comparison.pixelThreshold),roi:pixelMetrics(a.rgba,b.rgba,a.width,a.height,roi,spec.comparison.pixelThreshold)});
    }
    for(const [kind,page] of Object.entries(pages)){
      const orders={reverse:[...times].reverse(),shuffled:[...times].sort((a,b)=>Math.sin(a*173+.7)-Math.sin(b*173+.7)),repeat:times};
      for(const [order,probeTimes] of Object.entries(orders)){
        for(const time of probeTimes)if(sha((await pixels(page,time)).rgba)!==refs[kind].get(time))throw Error(`${kind} ${order} differs at ${time}`);
        determinism.push({kind,order,probes:probeTimes.length,equal:true});
      }
      const fresh=await pageAt(browser,local,kind==='source'?'/examples/signal.html':'/examples/rea-signal/index.html',options.scale,project,errors);
      for(const time of times)if(sha((await pixels(fresh,time)).rgba)!==refs[kind].get(time))throw Error(`${kind} fresh differs at ${time}`);
      await fresh.close();determinism.push({kind,order:'fresh',probes:times.length,equal:true});
      if(refs[kind].get(1.234)===refs[kind].get(1.235))throw Error(`${kind}: subframes collapsed`);
    }
    const cue=id=>project.events.find(event=>event.id===id).at;
    const nearest=time=>rows.reduce((best,row)=>Math.abs(row.time-time)<Math.abs(best.time-time)?row:best);
    await sheet(pages.source,[nearest(cue('arrival')),nearest(cue('contact')),nearest(cue('split')),nearest(cue('resolve'))],path.join(out,'key-comparison.png'));
    await sheet(pages.source,rows.filter(row=>Math.abs(row.time/(60/project.bpm)-Math.round(row.time/(60/project.bpm)))<1e-7),path.join(out,'beat-comparison.png'));
    await sheet(pages.source,rows.filter(row=>Math.abs(row.time-cue('contact'))<=.201),path.join(out,'contact-comparison.png'),{crop:[580,200,760,680].map(value=>Math.round(value*options.scale)),thumbWidth:280,title:'Contact crop — Source | Reconstruction | Difference ×4'});
    await sheet(pages.source,[nearest(cue('resolve'))],path.join(out,'thumbnail-comparison.png'),{thumbWidth:360});
    const threshold=spec.comparison;
    const control=await pixels(pages.source,cue('resolve')),blank=Buffer.alloc(control.rgba.length);
    const paper=project.palette.paper.slice(1).match(/../g).map(value=>parseInt(value,16));
    for(let i=0;i<blank.length;i+=4){blank[i]=paper[0];blank[i+1]=paper[1];blank[i+2]=paper[2];blank[i+3]=255;}
    const negativeControl={kind:'blank paper replacing resolved composition',time:cue('resolve'),full:pixelMetrics(control.rgba,blank,control.width,control.height,undefined,threshold.pixelThreshold),roi:pixelMetrics(control.rgba,blank,control.width,control.height,spec.comparison.roiLogical.map(value=>Math.round(value*options.scale)),threshold.pixelThreshold)};
    negativeControl.rejected=!withinThresholds(negativeControl,threshold);
    const pass=errors.length===0&&negativeControl.rejected&&measurements.every(row=>withinThresholds(row,threshold));
    const worst={};for(const region of ['full','roi'])worst[region]=Object.fromEntries(['mae','rmse','changedFraction'].map(metric=>{const row=measurements.reduce((a,b)=>a[region][metric]>b[region][metric]?a:b);return [metric,{value:row[region][metric],time:row.time}];}));
    const report={schemaVersion:1,sourceSha256:spec.source.moduleSha256,reconstructionSha256:sha(await readFile(path.join(repositoryRoot,'examples/rea-signal/reconstruction.mjs'))),projectSha256:sha(descriptor),browser:browser.version(),scale:options.scale,dimensions:[Math.round(project.width*options.scale),Math.round(project.height*options.scale)],method:`MAE and RMSE over RGB byte levels 0..255; changed pixel if any RGB delta >${threshold.pixelThreshold}; no spatial registration, no temporal blur. All RGBA bytes hashed for determinism.`,roiLogical:spec.comparison.roiLogical,thresholds:threshold,pass,worst,measurements,negativeControl,determinism,continuousSubframes:true,errors,limits:['Thresholds are regression guards, not perceptual equivalence.','Independent contour/grain produce nonzero pixel differences.','Only sampled times and this browser/platform tested.','Seeks are driven by Playwright; these metrics are not REA findings.']};
    await json(path.join(out,'metrics.json'),report);
    if(errors.length)throw Error(errors.join('\n'));if(!pass)throw Error('Comparison exceeds regression thresholds; inspect metrics.json and sheets');
    console.log(`Compared ${times.length} times; ${determinism.length} determinism orders; pass=${pass}`);return report;
  }finally{await browser?.close();await local?.close();}
}
export async function renderCase(options){
  const common=['--html=/examples/rea-signal/index.html','--project=examples/rea-signal/project.json','--samples=4'];
  if(options.chrome)common.push(`--chrome=${options.chrome}`);if(options.ffmpeg)common.push(`--ffmpeg=${options.ffmpeg}`);if(options.overwrite)common.push('--overwrite');
  await render(renderArgs([...common,'--draft',`--out=${options.out}/draft.mp4`]));
  await render(renderArgs([...common,`--out=${options.out}/final.mp4`]));
}
export async function investigate(options){
  const out=path.resolve(repositoryRoot,options.out),evidence=path.join(out,'evidence');
  await mkdir(evidence,{recursive:true});
  const indexFile=path.join(evidence,'index.json');
  if(!options.overwrite)try{await access(indexFile);throw Error('Evidence exists; use --overwrite to create a new investigation index');}catch(error){if(error.code!=='ENOENT')throw error;}
  const npm=await npmCli(options),project=compileProject(JSON.parse(await readFile(path.join(repositoryRoot,'project.json'),'utf8')));
  const records=[],errors=[];let local,browser;
  async function rea(name,args){
    console.log(`REA ${args[0]}`);
    const result=await execute(process.execPath,[npm,'exec','--ignore-scripts','--yes','--package=rea-agents@6.5.0','--','rea',...args,'--json']);
    const parsed=JSON.parse(result.stdout),file=path.join(evidence,`${name}.json`);
    await writeFile(file,result.stdout,'utf8');
    if(result.stderr)await writeFile(path.join(evidence,`${name}.stderr.txt`),result.stderr);
    records.push({name,command:['rea',...args,'--json'],file:path.relative(out,file).replaceAll('\\','/'),sha256:sha(result.stdout),evidenceId:parsed.id??parsed.evidence_id??null});return parsed;
  }
  try{
    local=await serve({port:0});const port=await freePort(),endpoint=`http://127.0.0.1:${port}`;
    browser=await chromium.launch({headless:true,executablePath:options.chrome||process.env.CHROME_PATH||undefined,args:[`--remote-debugging-port=${port}`,'--remote-debugging-address=127.0.0.1','--force-color-profile=srgb']});
    const page=await pageAt(browser,local,'/examples/signal.html',options.scale,project,errors);
    const pose=project.events.find(e=>e.id==='resolve').at;
    await pixels(page,pose);
    await rea('targets',['list-browser-targets',endpoint]);
    const targets=await (await fetch(`${endpoint}/json/list`)).json();
    const target=targets.find(target=>target.url.startsWith(local.url+'/examples/signal.html'));
    if(!target)throw Error('Dedicated source target absent');
    await rea('inspect',['inspect-web-page',endpoint,target.id,'--observation-ms','1000','--include-script-sources']);
    await rea('bundle',['analyze-web-bundle',endpoint,target.id]);
    await rea('screenshot',['capture-web-screenshot',endpoint,target.id]);
    // REA's screenshot is a viewport artifact. This separately labelled Canvas PNG is
    // produced by Playwright's seek probe, never attributed to passive REA execution.
    await writeFile(path.join(evidence,'source-resolve.png'),(await pixels(page,pose)).png);
    const exported=path.join(evidence,`scripts-${randomUUID()}`);
    await rea('export',['export-web-scripts',path.join(evidence,'inspect.json'),exported]);
    await rea('javascript',['analyze-javascript-application',path.join(exported,'files')]);
    if(errors.length)throw Error(errors.join('\n'));
    const sources={};for(const file of ['examples/signal.html','examples/signal.mjs','project.json','lib/motion.mjs','lib/project.mjs'])sources[file]=sha(await readFile(path.join(repositoryRoot,file)));
    const index={reaVersion:'6.5.0',reaCommit:'408704827057280b240c91963ee5590fd4dcc988',target:'/examples/signal.html',browser:browser.version(),node:process.version,scale:options.scale,viewport:[Math.round(project.width*options.scale),Math.round(project.height*options.scale)],pose,records,sources,errors,limits:['REA observation starts after initial page load; zero new network traffic does not mean no resources loaded.','Playwright calls seek; passive REA does not evaluate the animation.','Source reading is authorized. Reconstruction is not a clean-room exercise.']};
    await json(indexFile,index);console.log(`Evidence index: ${indexFile}`);return index;
  }finally{await browser?.close();await local?.close();}
}

export async function runCase(options){
  if(options.phase==='investigate'||options.phase==='all')await investigate(options);
  if(options.phase==='compare'||options.phase==='all')await compare(options);
  if(options.phase==='render'||options.phase==='all')await renderCase(options);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{await runCase(parseCaseArgs(process.argv.slice(2)));}catch(error){console.error(error.stack||error);process.exitCode=1;}
}
