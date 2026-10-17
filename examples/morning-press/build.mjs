// Original geometry and direction by GPT-6 Astra. Authoring only: the player
// consumes the autonomous project.json and never executes this generator.
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {compileFilm} from '../../core/film.mjs';

const cue=(id,offset=0)=>offset?{cue:id,offset}:{cue:id};
const keys=(...entries)=>({keys:entries.map(([at,value,ease='smooth'])=>({at:typeof at==='string'?cue(at):at,value,ease}))});
const path=commands=>({type:'path',commands});
const line=(...points)=>path(points.map(([x,y],i)=>[i?'L':'M',x,y]));
const poly=(...points)=>path([...points.map(([x,y],i)=>[i?'L':'M',x,y]),['Z']]);
const ellipse=(rx,ry=rx,cx=0,cy=0)=>({type:'ellipse',rx,ry,cx,cy});
const objects=[];
const add=(id,geometry,options={})=>{const o={id,geometry,fill:'none',stroke:'ink',strokeWidth:3,boil:.65,...options};objects.push(o);return o;};
const solid=(id,geometry,fill,options={})=>add(id,geometry,{fill,...options});
const cues=[
  {id:'composition-opening',at:.6},
  {id:'feed-start',at:.8},
  {id:'feed-stop',at:2.65,sound:{hz:380,gain:.12,duration:.12,pan:-.55}},
  {id:'anticipation',at:2.9},
  {id:'cut-pressure',at:3.2},
  {id:'press-start',at:3.55},
  {id:'pressure',at:4.35,sound:{hz:94,gain:.22,duration:.28,pan:-.3}},
  {id:'composition-pressure',at:4.55},
  {id:'pressure-release',at:4.95,sound:{hz:196,gain:.11,duration:.22,pan:-.2}},
  {id:'press-up',at:5.8},
  {id:'cut-reveal',at:6.1},
  {id:'eject',at:6.4,sound:{hz:280,gain:.1,duration:.16,pan:0}},
  {id:'reveal-middle',at:7.7},
  {id:'composition-reveal',at:8.2},
  {id:'paper-overrun',at:9.25},
  {id:'paper-stop',at:9.55,sound:{hz:520,gain:.1,duration:.24,pan:.6}},
  {id:'cut-print',at:9.8},
  {id:'composition-payoff',at:11},
  {id:'hold',at:12},
  {id:'last-frame',at:{frame:419}}
];
const paperX=keys([0,-310],['feed-start',-310],['feed-stop',640,[.14,.65,.24,1]],['eject',640],['paper-overrun',1420,'smooth'],['paper-stop',1410]);
const paperY=keys([0,731],['feed-stop',731],['eject',731],['reveal-middle',731],['paper-overrun',755],['paper-stop',757]);
const paperRot=keys([0,-1.1],['feed-stop',0],['eject',0],['paper-overrun',-.65],['paper-stop',-.35]);
const paper=(extra={})=>({x:paperX,y:paperY,rotation:paperRot,...extra});
const printed=keys([0,0],['pressure',1,'hold']);

// Broad quiet support: one tabletop and an irregular lower edge.
solid('table-wash',path([['M',95,935],['C',580,927,1190,939,1830,932],['L',1841,978],['C',1300,984,518,974,90,982],['Z']]),'shade',{stroke:'none'});
add('table-edge',path([['M',94,935],['C',650,929,1220,940,1832,932]]),{strokeWidth:3.2});
add('table-under-edge',path([['M',112,975],['C',700,970,1260,984,1815,974]]),{strokeWidth:1.8,opacity:.5});
// Back silhouette and aperture are behind the travelling sheet.
solid('press-back',path([['M',320,921],['L',332,376],['C',333,257,382,170,498,153],['L',783,153],['C',890,162,948,244,949,374],['L',960,920],['Z']]),'ink',{strokeWidth:3.5});
solid('arch-opening',path([['M',429,547],['L',431,369],['C',432,295,473,260,537,256],['L',743,256],['C',806,260,846,300,847,369],['L',850,547],['Z']]),'paper',{strokeWidth:2.5});
solid('paper-feed-slot',poly([302,559],[978,559],[978,908],[302,908]),'ink',{stroke:'none'});

// The sheet and every ink element share all transform tracks exactly.
solid('sheet',path([['M',-275,-174],['L',268,-177],['Q',278,-176,278,-166],['L',275,166],['Q',274,175,264,176],['L',-266,174],['Q',-276,174,-277,164],['L',-278,-164],['Q',-278,-172,-275,-174],['Z']]),'sheet',paper({strokeWidth:2.2,boil:.5}));
add('sheet-edge',path([['M',-261,164],['C',-78,168,94,167,261,165]]),paper({stroke:'shade',strokeWidth:1.4,boil:.35}));
// Solar print, independently drawn, irregular but optically balanced.
solid('printed-sun',path([['M',74,-25],['C',73,20,42,50,-1,52],['C',-46,52,-78,22,-78,-22],['C',-79,-66,-46,-101,-2,-101],['C',40,-104,75,-72,74,-25],['Z']]),'ochre',paper({opacity:printed,strokeWidth:2.2,boil:.85}));
for(let i=0;i<22;i++){
  const angle=(-172+i*360/22)*Math.PI/180;
  const inner=93+(i%3)*2,outer=121+(i%4)*4;
  const x=Math.cos(angle),y=Math.sin(angle);
  // Keep the lower rays above the horizon and let the composition breathe.
  add(`sun-ray-${i}`,path([['M',x*inner,-25+y*inner],['Q',x*(inner+outer)/2+((i%2)*2-1)*2,-25+y*(inner+outer)/2,x*outer,-25+y*outer]]),paper({opacity:printed,stroke:i%3?'ink':'ochre',strokeWidth:i%3?3.3:5.5,boil:.55}));
}
for(let i=0;i<7;i++){
  const yy=-62+i*12,half=Math.sqrt(Math.max(0,64*64-(yy+25)**2));
  add(`sun-grain-${i}`,path([['M',-half+8,yy],['C',-half*.25,yy-2,half*.4,yy+2,half-3,yy-1]]),paper({opacity:keys([0,0],['pressure',.19,'hold']),stroke:'ink',strokeWidth:1.1,boil:.6}));
}
add('print-horizon',path([['M',-187,117],['C',-80,113,73,114,185,117]]),paper({opacity:printed,strokeWidth:3.4,boil:.65}));
add('print-land-left',path([['M',-188,117],['C',-141,78,-107,79,-66,116]]),paper({opacity:printed,strokeWidth:2.6,boil:.55}));
add('print-land-right',path([['M',73,115],['C',111,92,145,93,185,117]]),paper({opacity:printed,strokeWidth:2.6,boil:.55}));
add('print-lower-rule',path([['M',-113,137],['C',-36,134,30,137,114,135]]),paper({opacity:printed,strokeWidth:1.8,boil:.4}));

// Front housing occludes every part of the motif during printing.
solid('press-front',path([['M',314,552],['Q',316,539,331,539],['L',946,539],['Q',961,540,963,554],['L',959,901],['Q',957,923,935,923],['L',342,923],['Q',318,921,317,899],['Z']]),'ink',{strokeWidth:4});
solid('press-front-inset',path([['M',359,593],['Q',361,580,375,579],['L',903,579],['Q',918,580,918,595],['L',916,865],['Q',914,879,899,881],['L',378,881],['Q',361,879,360,865],['Z']]),'paper',{stroke:'shade',strokeWidth:3});
// A single broad open arch references cast iron, not a label or fictitious brand.
add('apron-arch',path([['M',420,842],['L',420,739],['C',420,649,495,620,639,620],['C',780,620,853,650,854,739],['L',854,842]]),{stroke:'ink',strokeWidth:13,boil:.8});
add('apron-foot-left',line([403,843],[438,843]),{strokeWidth:12});
add('apron-foot-right',line([837,843],[871,843]),{strokeWidth:12});
solid('front-fastener-left',ellipse(8), 'ink',{x:383,y:603,stroke:'none'});
solid('front-fastener-right',ellipse(8), 'ink',{x:892,y:603,stroke:'none'});
add('body-highlight-left',path([['M',351,528],['L',354,377],['C',355,281,397,220,455,202]]),{stroke:'shade',strokeWidth:2,opacity:.8});
add('body-highlight-right',path([['M',918,524],['L',916,378],['C',915,286,872,219,819,203]]),{stroke:'shade',strokeWidth:2,opacity:.65});
for(let i=0;i<5;i++)add(`body-hatch-${i}`,line([374+i*7,875],[389+i*7,891]),{stroke:'shade',strokeWidth:1.3,opacity:.65});
// The heavy platen's lower edge hits the bed at y=540, then holds.
const platenY=keys([0,430],['press-start',430],['pressure',487,[.45,0,.72,1]],['pressure-release',487],['press-up',430,[.3,0,.45,1]]);
solid('press-bed',poly([393,537],[884,537],[895,550],[383,550]),'shade',{strokeWidth:3});
solid('platen',path([['M',-235,0],['Q',-244,0,-245,10],['L',-245,42],['Q',-244,53,-234,53],['L',233,53],['Q',245,52,245,41],['L',245,10],['Q',244,0,232,0],['Z']]),'ink',{x:640,y:platenY,strokeWidth:3.3});
add('platen-edge',line([-222,39],[221,39]),{x:640,y:platenY,stroke:'shade',strokeWidth:2.2});
solid('shaft',poly([-21,-201],[21,-201],[21,3],[-21,3]),'shade',{x:640,y:platenY,strokeWidth:3.5});
for(let i=0;i<11;i++)add(`shaft-thread-${i}`,line([-20,-185+i*16],[20,-173+i*16]),{x:640,y:platenY,strokeWidth:2.1});
solid('shaft-collar',poly([-54,-8],[54,-8],[54,8],[-54,8]),'ink',{x:640,y:platenY,strokeWidth:2.5});
solid('top-bearing',path([['M',598,197],['L',682,197],['L',688,278],['Q',641,292,592,278],['Z']]),'ink',{strokeWidth:3});
add('bearing-highlight',line([608,211],[608,266]),{stroke:'shade',strokeWidth:2});
// One lever and end knob, rigidly attached, rotating around the fixed bearing.
const leverRotation=keys([0,-13],['anticipation',-13],['press-start',-25],['pressure',24,[.37,0,.6,1]],['pressure-release',24],['press-up',-7,[.3,0,.4,1]],['eject',-11]);
const lever={x:640,y:213,rotation:leverRotation};
solid('lever',path([['M',-249,-8],['Q',-259,0,-249,8],['L',233,8],['Q',249,0,233,-8],['Z']]),'ink',{...lever,strokeWidth:3});
solid('lever-grip',path([['M',209,-22],['C',226,-33,253,-27,257,-12],['C',266,13,247,31,226,25],['C',207,20,200,-8,209,-22],['Z']]),'vermillion',{...lever,strokeWidth:3.3});
add('grip-mark',path([['M',228,-15],['Q',243,-10,242,4]]),{...lever,stroke:'sheet',strokeWidth:2,opacity:.55});
solid('lever-hub',ellipse(24), 'shade',{x:640,y:213,strokeWidth:3});
solid('hub-pin',ellipse(7), 'ink',{x:640,y:213,stroke:'none'});
// Irregular feet settle the machine and provide an architectural base.
solid('foot-left',poly([326,916],[425,916],[432,936],[315,936]),'ink',{strokeWidth:3});
solid('foot-right',poly([850,916],[950,916],[962,936],[841,936]),'ink',{strokeWidth:3});

const project={schema:'motion/1',id:'morning-press',width:1920,height:1080,fps:30,duration:14,seed:17291,bpm:120,beatOffset:0,beatsPerBar:4,
  palette:{paper:'#EEE5D4',sheet:'#FAF3E4',ink:'#3D4E53',shade:'#D5C9B4',ochre:'#D9A33D',vermillion:'#BB604B'},grain:{count:4000,opacity:.11},cues,
  scenes:[
    {id:'atelier',start:0,end:cue('cut-pressure'),camera:{x:960,y:540,zoom:1},transition:{type:'fade',duration:.35,colour:'paper'}},
    {id:'pressure',start:cue('cut-pressure'),end:cue('cut-reveal'),camera:{x:641,y:439,zoom:1.5}},
    {id:'reveal',start:cue('cut-reveal'),end:cue('cut-print'),camera:{x:keys(['cut-reveal',1045],['eject',1045],['paper-stop',1130]),y:690,zoom:1.2}},
    {id:'print',start:cue('cut-print'),end:14,camera:{x:1440,y:749,zoom:2.1}}
  ],objects,
  qa:[
    ...['opening','pressure','reveal','payoff'].map(n=>({id:`composition-${n}`,at:cue(`composition-${n}`)})),
    ...['feed-stop','pressure','pressure-release','paper-stop'].flatMap(n=>[-1,0,1].map(offset=>({id:`${n}-${offset<0?'before':offset>0?'after':'contact'}`,at:cue(n,offset/30),object:n==='pressure'||n==='pressure-release'?'platen':'sheet'}))),
    ...['cut-pressure','cut-reveal','cut-print'].flatMap(n=>[-1,0,1].map(offset=>({id:`${n}-${offset<0?'before':offset>0?'after':'on'}`,at:cue(n,offset/30)}))),
    ...[-1,0,1].map(offset=>({id:`ejection-flow-${offset<0?'before':offset>0?'after':'middle'}`,at:cue('reveal-middle',offset/30),object:'sheet'})),
    {id:'hold',at:cue('hold'),object:'sheet'},{id:'last',at:cue('last-frame'),object:'sheet'}
  ]
};
const film=compileFilm(project);
for(const q of film.qa)film.sample(q.at);
writeFileSync(fileURLToPath(new URL('./project.json',import.meta.url)),JSON.stringify(project,null,2)+'\n');
console.log(`Wrote autonomous motion/1 descriptor: ${objects.length} objects, ${film.cues.length} cues, ${film.qa.length} QA poses.`);
