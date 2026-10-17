import {compileFilm} from '../../core/film.mjs';
import {canvasAdapter,svgAdapter} from '../../core/adapters.mjs';
const params=new URLSearchParams(location.search),scale=Number(params.get('scale')??1),kind=params.get('adapter')??'canvas';
if(params.has('capture'))document.documentElement.dataset.capture='';
window.__motionReady=(async()=>{
  if(!['canvas','svg'].includes(kind))throw Error('adapter must be canvas or svg');
  const source=new URL(params.get('project')??'./project.json',location.href);
  if(source.origin!==location.origin)throw Error('descriptor must be local to this server');
  const response=await fetch(source);if(!response.ok)throw Error(`project HTTP ${response.status}`);
  const film=compileFilm(await response.json()),surface=kind==='canvas'?document.createElement('canvas'):document.createElementNS('http://www.w3.org/2000/svg','svg');
  surface.id='film';document.querySelector('#stage').replaceChildren(surface);
  const adapter=(kind==='canvas'?canvasAdapter:svgAdapter)(surface,{scale});
  window.film=film;window.seek=t=>adapter.render(film.sample(t));window.seek(0);
  const scrub=document.querySelector('#scrub'),clock=document.querySelector('#clock'),button=document.querySelector('#play');scrub.max=film.project.duration;
  let playing=false,anchor=0,position=0;
  const show=t=>{position=t;window.seek(t);scrub.value=t;clock.value=`${t.toFixed(2)} s`;};
  function tick(now){if(!playing)return;const t=Math.min(film.project.duration,(now-anchor)/1000);show(t);if(t<film.project.duration)requestAnimationFrame(tick);else{playing=false;button.textContent='Play';}}
  button.onclick=()=>{playing=!playing;button.textContent=playing?'Pause':'Play';if(playing){if(position>=film.project.duration)position=0;anchor=performance.now()-position*1000;requestAnimationFrame(tick);}};
  scrub.oninput=()=>{playing=false;button.textContent='Play';show(Number(scrub.value));};
  return true;
})();
