/* Isolated, reversible homepage halo; no perpetual animation loop. */
(()=>{
 const hero=document.querySelector('[data-static-page="home"] #menu');
 const logo=hero?.querySelector('img[alt="SO_Logo.png"]');
 if(!logo)return;
 const enabled=matchMedia('(min-width:768px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
 const halo=document.createElement('div');
 halo.className='stargate-halo';halo.setAttribute('aria-hidden','true');hero.append(halo);
 logo.classList.add('stargate-logo');
 let x=0,y=0,tx=0,ty=0,frame=0,active=false,last=0;
 const stop=()=>{
  active=false;halo.classList.remove('is-active');
  logo.style.removeProperty('--logo-x');logo.style.removeProperty('--logo-y');
  cancelAnimationFrame(frame);frame=0;last=0;
 };
 const tick=time=>{
  const ease=1-Math.exp(-Math.min(time-(last||time-16),50)/95);last=time;
  x+=(tx-x)*ease;y+=(ty-y)*ease;
  halo.style.setProperty('--halo-x',x+'px');halo.style.setProperty('--halo-y',y+'px');
  if(active&&(Math.abs(tx-x)+Math.abs(ty-y)>.15))frame=requestAnimationFrame(tick);
  else{frame=0;last=0;}
 };
 hero.addEventListener('pointermove',e=>{
  if(!enabled.matches||e.pointerType!=='mouse'){stop();return;}
  const r=logo.getBoundingClientRect(),h=hero.getBoundingClientRect();
  const dx=Math.max(r.left-e.clientX,0,e.clientX-r.right),dy=Math.max(r.top-e.clientY,0,e.clientY-r.bottom);
  if(Math.hypot(dx,dy)>110){stop();return;}
  tx=e.clientX-h.left;ty=e.clientY-h.top;
  if(!active){x=tx;y=ty;active=true;halo.classList.add('is-active');}
  logo.style.setProperty('--logo-x',Math.max(-2,Math.min(2,(e.clientX-r.left-r.width/2)/r.width*4))+'px');
  logo.style.setProperty('--logo-y',Math.max(-2,Math.min(2,(e.clientY-r.top-r.height/2)/r.height*3))+'px');
  if(!frame)frame=requestAnimationFrame(tick);
 },{passive:true});
 hero.addEventListener('pointerleave',stop);window.addEventListener('blur',stop);
 enabled.addEventListener('change',stop);window.addEventListener('resize',stop);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
})();
