/* No Squarespace account, API, or platform runtime is needed to serve these pages. */
document.documentElement.classList.add('js');
document.body.classList.remove('enable-load-effects');
document.querySelectorAll('.Site,.Index-page-image').forEach(e=>e.classList.add('loaded'));
const sizeHero=()=>{
 const first=document.querySelector('.Index-page');
 const bar=document.querySelector('.Mobile-bar--top');
 if(first) first.style.minHeight=Math.max(0,innerHeight-(bar?.getBoundingClientRect().height||0))+'px';
};
sizeHero(); window.addEventListener('resize',sizeHero);
document.querySelectorAll('.spacer-block[data-aspect-ratio]').forEach(e=>{
  const content=e.querySelector('.sqs-block-content');
  content.classList.add('sqs-intrinsic');
  content.style.paddingBottom=Number(e.dataset.aspectRatio)+'%';
});
if (window.Typekit) { try { window.Typekit.load({async:true}); } catch (_) {} }
document.querySelectorAll('.sqs-gallery').forEach(e=>e.classList.add('sqs-gallery-design-grid'));
document.querySelectorAll('.sqs-gallery .slide').forEach(e=>e.classList.add('sqs-gallery-design-grid-slide'));
document.querySelectorAll('.sqs-video-wrapper').forEach(e=>e.classList.add('video-fill'));
document.querySelectorAll('.sqs-video-background').forEach(background => {
  const url = new URL(background.dataset.configUrl);
  const id = url.searchParams.get('v');
  if (!id || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const frame = document.createElement('iframe');
  frame.src = `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&mute=1&loop=1&playlist=${encodeURIComponent(id)}&controls=0&playsinline=1&rel=0`;
  frame.title = 'Space Oddity background reel';
  frame.allow = 'autoplay; encrypted-media';
  frame.tabIndex = -1;
  frame.setAttribute('aria-hidden','true');
  background.append(frame);
});
// The original Brine template uses a 0.5 scroll factor and averages section
// and viewport height for its background canvas.
const backgrounds=[...document.querySelectorAll('.Index-page-image')];
const updateBackgrounds=()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  backgrounds.forEach(background=>{
    const rect=background.closest('.Index-page').getBoundingClientRect();
    const height=reduce?rect.height:(rect.height+innerHeight)/2;
    background.style.height=height+'px';
    background.style.transform=reduce?'none':`translate3d(0,${-rect.top/2}px,0)`;
    const frame=background.querySelector('iframe');
    if(frame){ const width=Math.max(rect.width,height*16/9); frame.style.width=width+'px'; frame.style.height=width*9/16+'px'; }
  });
};
let framePending=false;
addEventListener('scroll',()=>{if(!framePending){framePending=true;requestAnimationFrame(()=>{updateBackgrounds();framePending=false;});}},{passive:true});
addEventListener('resize',updateBackgrounds);
addEventListener('load',updateBackgrounds);
new ResizeObserver(updateBackgrounds).observe(document.querySelector('main'));
updateBackgrounds();
const modal = document.createElement('dialog');
modal.className = 'video-modal';
modal.setAttribute('aria-label','Video player');
document.body.append(modal);
const closeVideo = () => { modal.close(); modal.replaceChildren(); };
modal.addEventListener('click', e => { if(e.target === modal) closeVideo(); });
modal.addEventListener('close', () => modal.replaceChildren());
document.querySelectorAll('.sqs-video-wrapper[data-html]').forEach((wrapper,index) => {
  const source = new DOMParser().parseFromString(wrapper.dataset.html, 'text/html').querySelector('iframe');
  if (!source) return;
  wrapper.tabIndex = 0;
  wrapper.setAttribute('role','button');
  const label = wrapper.closest('.sqs-block')?.nextElementSibling?.querySelector('h3')?.textContent?.trim();
  const outer = wrapper.closest('.content-wrapper');
  outer?.removeAttribute('role'); outer?.removeAttribute('tabindex');
  wrapper.setAttribute('aria-label',`Play ${label || 'film ' + (index+1)}`);
  const openVideo = () => {
    const close = document.createElement('button');
    close.className = 'video-close'; close.textContent = '×'; close.setAttribute('aria-label','Close video');
    close.addEventListener('click',closeVideo);
    const frame = document.createElement('iframe');
    frame.allowFullscreen=true;
    let url = new URL(source.getAttribute('src'),'https://www.spaceoddity.xyz');
    if(url.hostname==='cdn.embedly.com' && url.searchParams.get('src')) url=new URL(url.searchParams.get('src'));
    url.protocol='https:';
    url.searchParams.set('autoplay','1');
    frame.src = url.href; frame.title = wrapper.getAttribute('aria-label');
    frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    modal.replaceChildren(close,frame); modal.showModal();
  };
  wrapper.addEventListener('click',openVideo);
  wrapper.addEventListener('keydown',e => { if(e.key==='Enter'||e.key===' ') { e.preventDefault(); openVideo(); } });
});
