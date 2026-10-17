import {pathString} from './geometry.mjs';
const NS='http://www.w3.org/2000/svg';
function trace(ctx,path) {ctx.beginPath();for(const [op,...v] of path){if(op==='M')ctx.moveTo(...v);else if(op==='L')ctx.lineTo(...v);else if(op==='C')ctx.bezierCurveTo(...v);else if(op==='Q')ctx.quadraticCurveTo(...v);else ctx.closePath();}}
export function canvasAdapter(canvas,{scale=1}={}) {
  if(!Number.isFinite(scale)||scale<=0)throw Error('positive scale required');
  const ctx=canvas.getContext('2d');
  return {render(frame){
    canvas.width=Math.round(frame.width*scale);canvas.height=Math.round(frame.height*scale);
    canvas.removeAttribute('style');canvas.style.display='block';
    ctx.scale(scale,scale);ctx.fillStyle=frame.paper;ctx.fillRect(0,0,frame.width,frame.height);
    ctx.save();ctx.translate(frame.width/2,frame.height/2);ctx.scale(frame.camera.zoom,frame.camera.zoom);ctx.translate(-frame.camera.x,-frame.camera.y);
    if(frame.mask){trace(ctx,frame.mask);ctx.clip();}
    for(const o of frame.objects) {
      if(!o.visible)continue;ctx.save();
      if(o.mask){trace(ctx,o.mask);ctx.clip();}
      const tr=o.transform;ctx.translate(tr.x,tr.y);ctx.rotate(tr.rotation*Math.PI/180);ctx.scale(tr.scaleX,tr.scaleY);ctx.globalAlpha=o.opacity;
      if(o.fill!=='none'){trace(ctx,o.path);ctx.fillStyle=o.fill;ctx.fill();}
      if(o.stroke!=='none'&&o.strokeWidth){trace(ctx,o.inkPath);ctx.strokeStyle=o.stroke;ctx.lineWidth=o.strokeWidth;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
      ctx.restore();
    }
    ctx.restore();
    trace(ctx,frame.grain.path);ctx.globalAlpha=frame.grain.opacity;ctx.strokeStyle=frame.grain.colour;ctx.lineWidth=.8;ctx.stroke();ctx.globalAlpha=1;
    const tr=frame.transition;if(tr&&tr.progress<1){ctx.fillStyle=tr.colour;if(tr.type==='fade'){ctx.globalAlpha=1-tr.progress;ctx.fillRect(0,0,frame.width,frame.height);}else ctx.fillRect(frame.width*tr.progress,0,frame.width*(1-tr.progress),frame.height);}
    ctx.globalAlpha=1;return frame;
  }};
}
function element(tag,attributes={}) {const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attributes))e.setAttribute(k,String(v));return e;}
export function svgAdapter(svg,{scale=1,idPrefix=svg.id}={}) {
  if(!Number.isFinite(scale)||scale<=0)throw Error('positive scale required');
  if(typeof idPrefix!=='string'||!/^[a-zA-Z][\w-]*$/.test(idPrefix))throw Error('SVG requires a stable unique idPrefix or root id');
  return {render(frame){
    for(const attr of [...svg.attributes])if(attr.name!=='id')svg.removeAttribute(attr.name);
    svg.setAttribute('xmlns',NS);svg.setAttribute('width',Math.round(frame.width*scale));svg.setAttribute('height',Math.round(frame.height*scale));svg.setAttribute('viewBox',`0 0 ${frame.width} ${frame.height}`);svg.style.display='block';svg.replaceChildren();
    const defs=element('defs');svg.append(defs,element('rect',{width:frame.width,height:frame.height,fill:frame.paper}));
    let clipIndex=0;const mask=(group,path)=>{if(!path)return;const id=`${idPrefix}-clip-${clipIndex++}`,clip=element('clipPath',{id,clipPathUnits:'userSpaceOnUse'});clip.append(element('path',{d:pathString(path)}));defs.append(clip);group.setAttribute('clip-path',`url(#${id})`);};
    const camera=element('g',{transform:`translate(${frame.width/2} ${frame.height/2}) scale(${frame.camera.zoom}) translate(${-frame.camera.x} ${-frame.camera.y})`});svg.append(camera);mask(camera,frame.mask);
    for(const o of frame.objects) {
      const clipGroup=element('g',{'data-object':o.id,display:o.visible?'inline':'none'});camera.append(clipGroup);mask(clipGroup,o.mask);
      const tr=o.transform,g=element('g',{transform:`translate(${tr.x} ${tr.y}) rotate(${tr.rotation}) scale(${tr.scaleX} ${tr.scaleY})`,opacity:o.opacity});clipGroup.append(g);
      g.append(element('path',{d:pathString(o.path),fill:o.fill,stroke:'none'}),element('path',{d:pathString(o.inkPath),fill:'none',stroke:o.stroke,'stroke-width':o.strokeWidth,'stroke-linejoin':'round','stroke-linecap':'round'}));
    }
    svg.append(element('path',{d:pathString(frame.grain.path),fill:'none',stroke:frame.grain.colour,'stroke-width':.8,opacity:frame.grain.opacity}));
    const tr=frame.transition;if(tr&&tr.progress<1)svg.append(element('rect',{x:tr.type==='wipe'?frame.width*tr.progress:0,y:0,width:tr.type==='wipe'?frame.width*(1-tr.progress):frame.width,height:frame.height,fill:tr.colour,opacity:tr.type==='fade'?1-tr.progress:1}));
    return frame;
  }};
}
