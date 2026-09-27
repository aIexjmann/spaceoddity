/* Original generative light-flight animation; remove the stargate includes to revert. */
(()=>{
 const hero=document.querySelector('[data-static-page="home"] #menu');
 if(!hero)return;
 const canvas=document.createElement('canvas');
 canvas.className='stargate-flight';canvas.setAttribute('aria-hidden','true');hero.append(canvas);
 const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return;}
 const pause=document.createElement('button');pause.className='stargate-pause';
 pause.type='button';pause.textContent='Pause motion';pause.setAttribute('aria-pressed','false');hero.append(pause);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let w=0,h=0,frame=0,last=0,time=0,paused=reduced.matches,visible=true;
 // Deterministic lanes create a coherent corridor, rather than random flashes.
 const lanes=Array.from({length:260},(_,i)=>({
  angle:i*2.39996323,phase:((Math.sin(i*127.1)*43758.5453)%1+1)%1,
  speed:.055+(i%7)*.005,length:.16+(i%5)*.025,
  hue:[188,220,265,294,325,18,44][i%7],width:1.3+(i%4)*.9
 }));
 function draw(){
  ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
  ctx.fillStyle='#03020d';ctx.fillRect(0,0,w,h);
  const cx=w*.5,cy=h*.47,reach=Math.hypot(w,h)*.72;
  const mist=ctx.createRadialGradient(cx,cy,0,cx,cy,reach);
  mist.addColorStop(0,'#090319');mist.addColorStop(.32,'#180a34');mist.addColorStop(.7,'#071625');mist.addColorStop(1,'#03020d');
  ctx.fillStyle=mist;ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation='screen';
  for(const lane of lanes){
   const z=(lane.phase+time*lane.speed)%1;
   const fade=Math.sin(Math.PI*z)**2;
   const angle=lane.angle+Math.sin(time*.1+lane.angle)*.06;
   const start=.035+Math.pow(z,2.35),end=.035+Math.pow(Math.min(1.15,z+lane.length),2.35);
   const vx=Math.cos(angle)*reach,vy=Math.sin(angle)*reach*.68;
   const x1=cx+vx*start,y1=cy+vy*start,x2=cx+vx*end,y2=cy+vy*end;
   const gradient=ctx.createLinearGradient(x1,y1,x2,y2);
   const hue=lane.hue+Math.sin(time*.12)*22;
   gradient.addColorStop(0,`hsla(${hue},100%,54%,0)`);
   gradient.addColorStop(.55,`hsla(${hue},100%,58%,${fade*.85})`);
   gradient.addColorStop(1,`hsla(${hue+22},100%,70%,0)`);
   ctx.strokeStyle=gradient;ctx.lineWidth=lane.width*(1+z*z*9);
   ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
   ctx.lineWidth=Math.max(.5,lane.width*z*.75);ctx.stroke();
  }
  ctx.globalCompositeOperation='source-over';
  // Quiet center and vignette keep the unchanged logo and navigation legible.
  const quiet=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(w,h)*.7);
  quiet.addColorStop(0,'rgba(2,1,12,.78)');quiet.addColorStop(.4,'rgba(2,1,12,.40)');quiet.addColorStop(1,'rgba(2,1,12,0)');
  ctx.fillStyle=quiet;ctx.fillRect(0,0,w,h);
  const edge=ctx.createRadialGradient(cx,cy,reach*.25,cx,cy,reach);
  edge.addColorStop(0,'transparent');edge.addColorStop(1,'rgba(0,0,8,.65)');
  ctx.fillStyle=edge;ctx.fillRect(0,0,w,h);
 }
 function resize(){
  const r=hero.getBoundingClientRect();w=r.width;h=r.height;
  const scale=Math.min(devicePixelRatio||1,1.5,1800/w);
  canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);draw();
 }
 function tick(now){
  time+=Math.min((now-(last||now))/1000,.05);last=now;draw();frame=requestAnimationFrame(tick);
 }
 function sync(){
  cancelAnimationFrame(frame);frame=0;last=0;
  pause.textContent=paused?'Play motion':'Pause motion';pause.setAttribute('aria-pressed',String(paused));
  if(!paused&&!document.hidden&&visible)frame=requestAnimationFrame(tick);
 }
 pause.addEventListener('click',()=>{paused=!paused;sync();});
 reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
 document.addEventListener('visibilitychange',sync);
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}).observe(hero);
 new ResizeObserver(resize).observe(hero);resize();sync();
})();
