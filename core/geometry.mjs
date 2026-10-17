import {hash,clamp} from '../lib/motion.mjs';
const arity={M:2,L:2,C:6,Q:4,Z:0};
export function pathGeometry(shape) {
  if(!shape || typeof shape!=='object')throw Error('geometry required');
  let commands;
  if(shape.type==='path')commands=structuredClone(shape.commands);
  else if(shape.type==='rect') {
    const {x=0,y=0,width:w,height:h}=shape;
    if(!(w>0&&h>0))throw Error('positive rect size required');
    commands=[['M',x,y],['L',x+w,y],['L',x+w,y+h],['L',x,y+h],['Z']];
  } else if(shape.type==='ellipse') {
    const {cx=0,cy=0,rx,ry=rx}=shape,k=.5522847498307936;
    if(!(rx>0&&ry>0))throw Error('positive ellipse radii required');
    commands=[['M',cx+rx,cy],['C',cx+rx,cy+k*ry,cx+k*rx,cy+ry,cx,cy+ry],['C',cx-k*rx,cy+ry,cx-rx,cy+k*ry,cx-rx,cy],['C',cx-rx,cy-k*ry,cx-k*rx,cy-ry,cx,cy-ry],['C',cx+k*rx,cy-ry,cx+rx,cy-k*ry,cx+rx,cy],['Z']];
  } else throw Error(`unknown geometry: ${shape.type}`);
  if(!Array.isArray(commands)||commands[0]?.[0]!=='M')throw Error('path must start with M');
  for(const c of commands)if(!(c[0] in arity)||c.length!==arity[c[0]]+1||!c.slice(1).every(Number.isFinite))throw Error('invalid path command');
  return commands;
}
export const pathString=commands=>commands.map(c=>c.join(' ')).join(' ');
export function boilPath(commands,seed,id,t,amount) {
  const tick=Math.floor(t*12);
  return commands.map((c,i)=>[c[0],...c.slice(1).map((v,j)=>v+(hash(seed,`${id}:${tick}:${i}:${j}`)-.5)*2*amount)]);
}
export function cubicPoint(points,p) {
  if(!Number.isFinite(p))throw Error('trajectory progress must be finite');
  if(!Array.isArray(points)||points.length!==4||points.some(a=>!Array.isArray(a)||a.length!==2||!a.every(Number.isFinite)))throw Error('trajectory needs four [x,y] control points');
  const u=clamp(p),v=1-u;
  const point=[0,1].map(i=>v**3*points[0][i]+3*v*v*u*points[1][i]+3*v*u*u*points[2][i]+u**3*points[3][i]);
  const tangent=[0,1].map(i=>3*v*v*(points[1][i]-points[0][i])+6*v*u*(points[2][i]-points[1][i])+3*u*u*(points[3][i]-points[2][i]));
  return {x:point[0],y:point[1],angle:Math.atan2(tangent[1],tangent[0])*180/Math.PI};
}
export function objectBounds(commands,transform,camera,width,height) {
  const a=transform.rotation*Math.PI/180,c=Math.cos(a),s=Math.sin(a),points=[];
  for(const command of commands)for(let i=1;i<command.length;i+=2) {
    const x=command[i]*transform.scaleX,y=command[i+1]*transform.scaleY;
    points.push([(transform.x+c*x-s*y-camera.x)*camera.zoom+width/2,(transform.y+s*x+c*y-camera.y)*camera.zoom+height/2]);
  }
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  // Conservative control-hull bounds; not exact Bézier extrema or stroke bounds.
  return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
}
