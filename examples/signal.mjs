import {clamp, mix, progress, smooth, spring, hash} from '../lib/motion.mjs';
import {compileProject, eventTime} from '../lib/project.mjs';

window.__motionReady = (async () => {
  const response = await fetch('../project.json');
  if (!response.ok) throw new Error(`project: HTTP ${response.status}`);
  const project = compileProject(await response.json()), cue = id => eventTime(project, id);
  const params = new URLSearchParams(location.search), scale = Number(params.get('scale') ?? 1);
  if (!Number.isFinite(scale) || scale <= 0 || scale > 2) throw new Error('invalid scale');
  const canvas = document.querySelector('#film'), ctx = canvas.getContext('2d', {willReadFrequently:true});
  canvas.width = Math.round(project.width * scale); canvas.height = Math.round(project.height * scale);
  const sx = canvas.width / project.width, sy = canvas.height / project.height;
  const p = project.palette, seed = project.seed, cx = project.width / 2, cy = project.height / 2;
  const grain = Array.from({length:2600}, (_,i) => [hash(seed, `paper-x-${i}`)*project.width, hash(seed,`paper-y-${i}`)*project.height, .4+hash(seed,`paper-r-${i}`)*1.2]);
  const isCapture = params.has('capture');
  if (isCapture) document.documentElement.dataset.capture = '';

  function paint(points, fill, id, t, line = p.ink, width = 2.5) {
    const tick = Math.floor(t * 12);
    ctx.beginPath();
    points.forEach(([x,y],i) => {
      const jx=(hash(seed,`${id}:${tick}:${i}:x`)-.5)*1.7, jy=(hash(seed,`${id}:${tick}:${i}:y`)-.5)*1.7;
      if(i) ctx.lineTo(x+jx,y+jy); else ctx.moveTo(x+jx,y+jy);
    });
    ctx.closePath();
    if(fill) {ctx.fillStyle=fill;ctx.fill();}
    if(line) {ctx.strokeStyle=line;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke();}
  }
  function oval(x,y,rx,ry,angle,fill,id,t,line=p.ink) {
    const c=Math.cos(angle),s=Math.sin(angle);
    paint(Array.from({length:64},(_,i)=>{const a=i/64*Math.PI*2,px=Math.cos(a)*rx,py=Math.sin(a)*ry;return [x+px*c-py*s,y+px*s+py*c];}),fill,id,t,line);
  }
  function inkArc(radius, start, end, alpha, id, t, width=3) {
    if(alpha<=0)return;
    ctx.save();ctx.globalAlpha*=clamp(alpha);ctx.beginPath();
    for(let i=0;i<=100;i++){
      const a=mix(start,end,i/100),d=(hash(seed,`${id}:${Math.floor(t*12)}:${i}`)-.5)*1.4;
      const x=cx+Math.cos(a)*(radius+d),y=cy+Math.sin(a)*(radius+d);
      if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
    }
    ctx.strokeStyle=p.ink;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();ctx.restore();
  }

  function seek(seconds) {
    if(!Number.isFinite(seconds))throw new TypeError('seek expects finite seconds');
    const t=clamp(seconds,0,project.duration), contact=cue('contact'), split=cue('split'), align=cue('align'), resolve=cue('resolve');
    ctx.resetTransform();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.scale(sx,sy);ctx.fillStyle=p.paper;ctx.fillRect(0,0,project.width,project.height);
    ctx.fillStyle=p.ink;ctx.globalAlpha=.045;
    for(const [x,y,r] of grain)ctx.fillRect(x,y,r,r);
    ctx.translate(cx,cy);ctx.scale(1.2,1.2);ctx.translate(-cx,-cy);
    ctx.globalAlpha=smooth(progress(t,0,.3))*(1-smooth(progress(t,cue('exit'),project.duration)));
    const opening=smooth(progress(t,cue('arrival'),contact));
    const settle=spring(t-contact,{frequencyHz:2.2,dampingRatio:.78});
    const assembly=smooth(progress(t,split,align)), finish=smooth(progress(t,align,resolve));
    inkArc(292,-Math.PI*.82,-Math.PI*.82+opening*Math.PI*1.64,.28*(1-finish),'guide',t);
    for(let i=0;i<3;i++){
      const delay=i*.07, spread=spring(t-contact-delay,{frequencyHz:2.3-i*.15,dampingRatio:.8});
      const angle=-Math.PI/2+i*Math.PI*2/3+(1-assembly)*.34+Math.sin((t-resolve)*3)*.008*finish;
      const radius=mix(82,183,spread)+Math.sin(assembly*Math.PI)*35;
      const x=cx+Math.cos(angle)*radius,y=cy+Math.sin(angle)*radius;
      const swell=1+.035*Math.exp(-Math.max(0,t-contact-delay)*4)*Math.sin(Math.max(0,t-contact-delay)*20);
      oval(x,y,105*swell,55/swell,angle+Math.PI/2,mixColour(i),`petal-${i}`,t);
    }
    const travel=smooth(progress(t,cue('arrival')-.4,contact)), ballX=mix(355,cx,travel), ballY=mix(130,cy,travel)-Math.sin(travel*Math.PI)*50;
    const pulse=t<contact?0:Math.exp(-(t-contact)*5)*Math.sin((t-contact)*17);
    oval(ballX,ballY,31*(1-.15*pulse),31*(1+.15*pulse),0,p.ink,'signal',t,null);
    if(t>=contact){
      const wave=progress(t,contact,contact+.65);
      inkArc(40+wave*245,0,Math.PI*2,(1-wave)*.5,'contact-wave',t);
    }
    inkArc(292,-Math.PI*.82,-Math.PI*.82+Math.PI*1.64,finish*.78,'resolved',t,4.5);
    oval(cx,cy,11+3*settle,11+3*settle,0,p.gold,'centre',t,null);
    ctx.globalAlpha=1;
    return {time:t,contact,assembly,finish,centre:[cx,cy],ball:[cx+(ballX-cx)*1.2,cy+(ballY-cy)*1.2],scale};
  }
  function mixColour(i){return [p.sage,p.clay,p.gold][i];}
  window.seek=seek;window.film={project};seek(0);
  await document.fonts.ready;

  // Preview clock is deliberately outside seek(). Export never starts this driver.
  const slider=document.querySelector('#scrub'),button=document.querySelector('#play'),clock=document.querySelector('#clock');
  slider.max=project.duration;
  let playing=false, origin=0, offset=0;
  const show=t=>{seek(t);slider.value=t;clock.value=`${t.toFixed(2)} s`;};
  function preview(now){
    if(!playing)return;
    const t=offset+(now-origin)/1000;
    if(t>=project.duration){playing=false;button.textContent='Play';show(project.duration);return;}
    show(t);requestAnimationFrame(preview);
  }
  slider.addEventListener('input',()=>{playing=false;button.textContent='Play';show(Number(slider.value));});
  button.addEventListener('click',()=>{playing=!playing;button.textContent=playing?'Pause':'Play';if(playing){offset=Number(slider.value);if(offset>=project.duration)offset=0;origin=performance.now();requestAnimationFrame(preview);}});
  return true;
})();
window.__motionReady.catch(error=>{window.__motionError=String(error);console.error(error);});
