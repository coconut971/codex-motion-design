import {compileProject as legacyCompile} from '../lib/project.mjs';
import {clamp,hash} from '../lib/motion.mjs';
import {compileTrack} from './tracks.mjs';
import {pathGeometry,boilPath,cubicPoint,objectBounds} from './geometry.mjs';

function freeze(value) { if(value && typeof value==='object') { Object.values(value).forEach(freeze);Object.freeze(value); } return value; }
function colour(value,palette) {
  const c=palette[value]??value;
  if(c==='none')return c;
  if(typeof c!=='string'||!/^#[\da-f]{6}$/i.test(c))throw Error(`invalid colour: ${value}`);
  return c;
}
function ids(list,label) {
  if(!Array.isArray(list)||!list.length)throw Error(`${label} required`);
  const seen=new Set();for(const item of list) { if(typeof item.id!=='string'||!item.id||seen.has(item.id))throw Error(`unique ${label} ids required`);seen.add(item.id); }return seen;
}

/** Compile once. Sampling allocates a complete frozen frame, independent of order. */
export function compileFilm(input) {
  const raw=structuredClone(input);
  if(raw.schema!=='motion/1')throw Error('expected schema motion/1');
  const cues=new Map(),duration=raw.duration;
  const time=(value,allowCue=true)=>{
    let t;
    if(typeof value==='number')t=value;
    else {
      if(!value || typeof value!=='object')throw Error('time requires seconds or one unit');
      const units=['seconds','beat','frame','cue'].filter(k=>Object.hasOwn(value,k));
      if(units.length!==1)throw Error('time must have exactly one unit');
      const unit=units[0];
      if(unit==='cue') { if(!allowCue||!cues.has(value.cue))throw Error(`unknown cue: ${value.cue}`);t=cues.get(value.cue).at+(value.offset??0); }
      else {if(!Number.isFinite(value[unit]))throw Error('finite time required');t=unit==='seconds'?value.seconds:unit==='frame'?value.frame/raw.fps:raw.beatOffset+value.beat*60/raw.bpm;}
      if(value.snap==='frame')t=Math.round(t*raw.fps)/raw.fps;
      else if(value.snap!==undefined)throw Error('only snap:frame is supported');
    }
    if(!Number.isFinite(t)||t<0||t>duration)throw Error(`time outside film: ${t}`);
    return t;
  };
  if(!Array.isArray(raw.cues))throw Error('cues required');
  for(const cue of raw.cues) {
    if(typeof cue.id!=='string'||!cue.id||cues.has(cue.id))throw Error('unique cue ids required');
    const at=time(cue.at,false);if(at>=duration)throw Error('cue must precede film end');
    if(cue.sound) {
      const s=cue.sound;
      if(![s.hz,s.gain,s.duration,s.pan].every(Number.isFinite)||s.hz<=0||s.hz>=24000||s.gain<0||s.gain>1||s.duration<=0||Math.abs(s.pan)>1)throw Error(`invalid sound: ${cue.id}`);
    }
    cues.set(cue.id,{...cue,at});
  }
  ids(raw.scenes,'scene');const objectIds=ids(raw.objects,'object'),palette=raw.palette??{};
  const scenes=raw.scenes.map(scene=>{
    const start=time(scene.start),end=time(scene.end);
    if(!(end>start))throw Error('scene end must exceed start');
    const visible=scene.objects??[...objectIds];
    if(!Array.isArray(visible)||visible.some(id=>!objectIds.has(id))||new Set(visible).size!==visible.length)throw Error('unknown or duplicate scene object');
    const camera=scene.camera??{},cam={x:compileTrack(camera.x,time,{fallback:raw.width/2}),y:compileTrack(camera.y,time,{fallback:raw.height/2}),zoom:compileTrack(camera.zoom,time,{fallback:1,log:true})};
    let transition=null;
    if(scene.transition) {
      const tr=scene.transition;
      if(!['fade','wipe'].includes(tr.type)||!Number.isFinite(tr.duration)||tr.duration<=0||tr.duration>end-start)throw Error('invalid scene transition');
      transition={type:tr.type,duration:tr.duration,colour:colour(tr.colour??'paper',palette)};
    }
    return {...scene,start,end,visible,cam,transition,mask:scene.mask?pathGeometry(scene.mask):null};
  });
  for(let i=0;i<scenes.length;i++)if(scenes[i].start!==(i?scenes[i-1].end:0))throw Error('scenes must cover film without gaps or overlaps');
  if(scenes.at(-1).end!==duration)throw Error('scenes must end at duration');
  const cuts=scenes.slice(1).map(s=>s.start);
  if(raw.cuts!==undefined)throw Error('cuts derive from scenes; do not supply a parallel cuts array');
  const events=[...cues.values()].sort((a,b)=>a.at-b.at).map(cue=>({...cue,beat:(cue.at-raw.beatOffset)*raw.bpm/60}));
  const project=legacyCompile({id:raw.id,width:raw.width,height:raw.height,fps:raw.fps,duration,seed:raw.seed,bpm:raw.bpm,beatOffset:raw.beatOffset,beatsPerBar:raw.beatsPerBar,palette,cuts,events:[]});
  // Seconds are canonical. A seconds→beats→seconds round trip can move an audio
  // cue by one sample at a half-sample boundary; beat is descriptive metadata.
  project.events=events;
  const objects=raw.objects.map(object=>{
    const channels={};
    for(const [name,fallback] of Object.entries({x:0,y:0,rotation:0,scaleX:1,scaleY:1,opacity:1}))channels[name]=compileTrack(object[name],time,{fallback});
    const path=pathGeometry(object.geometry),stroke=colour(object.stroke??'ink',palette),fill=colour(object.fill??'none',palette),strokeWidth=object.strokeWidth??3,boil=object.boil??.7;
    if(!Number.isFinite(strokeWidth)||strokeWidth<0||!Number.isFinite(boil)||boil<0)throw Error('invalid stroke');
    let trajectory=null;
    if(object.trajectory) {cubicPoint(object.trajectory.points,0);trajectory={...object.trajectory,progress:compileTrack(object.trajectory.progress,time)};}
    return {...object,channels,path,stroke,fill,strokeWidth,boil,trajectory,mask:object.mask?pathGeometry(object.mask):null};
  });
  const grainCount=raw.grain?.count??1000,grainOpacity=raw.grain?.opacity??.08;
  if(!Number.isInteger(grainCount)||grainCount<0||grainCount>20000||!Number.isFinite(grainOpacity)||grainOpacity<0||grainOpacity>1)throw Error('invalid grain');
  const grain=[];for(let i=0;i<grainCount;i++) {const x=hash(raw.seed,`grain-x-${i}`)*raw.width,y=hash(raw.seed,`grain-y-${i}`)*raw.height;grain.push(['M',x,y],['L',x+1+hash(raw.seed,`grain-w-${i}`)*2,y+.5]);}
  if(raw.qa?.length)ids(raw.qa,'QA');
  const qa=(raw.qa??[]).map(q=>({id:q.id,at:time(q.at),object:q.object??null}));
  for(const q of qa)if(q.object&&!objectIds.has(q.object))throw Error('unknown QA object');
  const paper=colour('paper',palette),ink=colour('ink',palette);
  function sample(requestedTime) {
    if(!Number.isFinite(requestedTime))throw Error('sample expects finite seconds');
    const t=clamp(requestedTime,0,duration),scene=scenes.find(s=>t>=s.start&&t<s.end)??scenes.at(-1);
    const camera={x:scene.cam.x(t),y:scene.cam.y(t),zoom:scene.cam.zoom(t)};
    const frameObjects=objects.map(object=>{
      const transform=Object.fromEntries(Object.entries(object.channels).map(([key,track])=>[key,track(t)]));
      if(object.trajectory) {const p=cubicPoint(object.trajectory.points,object.trajectory.progress(t));transform.x+=p.x;transform.y+=p.y;if(object.trajectory.orient)transform.rotation+=p.angle;}
      const opacity=clamp(transform.opacity);delete transform.opacity;
      return {id:object.id,visible:scene.visible.includes(object.id)&&opacity>0,opacity,transform,path:object.path,inkPath:boilPath(object.path,raw.seed,object.id,t,object.boil),fill:object.fill,stroke:object.stroke,strokeWidth:object.strokeWidth,mask:object.mask,bounds:objectBounds(object.path,transform,camera,raw.width,raw.height)};
    });
    const transition=scene.transition?{...scene.transition,progress:clamp((t-scene.start)/scene.transition.duration)}:null;
    return freeze({time:t,sceneId:scene.id,sceneTime:t-scene.start,width:raw.width,height:raw.height,paper,camera,objects:frameObjects,mask:scene.mask,transition,grain:{path:grain,opacity:grainOpacity,colour:ink}});
  }
  return Object.freeze({project:freeze(project),cues:freeze([...cues.values()]),cuts:freeze(cuts),qa:freeze(qa),sample});
}
