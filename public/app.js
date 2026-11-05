(() => {
  document.documentElement.classList.add('js');
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.site-nav');
  const closeMenu=()=>{
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label',toggle.dataset.openLabel);
    nav.classList.remove('is-open');
  };
  toggle.addEventListener('click',()=>{
    const open=toggle.getAttribute('aria-expanded')!=='true';
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?toggle.dataset.closeLabel:toggle.dataset.openLabel);
    nav.classList.toggle('is-open',open);
  });
  nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();toggle.focus();}});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
  matchMedia('(max-width: 700px)').addEventListener('change',closeMenu);
  const revealTargets=document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}},{threshold:.15});
    revealTargets.forEach(el=>observer.observe(el));
  }
  // Integration hook only. No analytics service, cookies or network collection.
  const track=(name)=>document.dispatchEvent(new CustomEvent('event:interaction',{detail:{name,path:location.pathname}}));
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-track]');
    if(el)track(el.dataset.track);
  });
})();
