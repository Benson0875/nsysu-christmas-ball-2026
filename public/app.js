(() => {
  document.documentElement.classList.add('js');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label',toggle.dataset.openLabel);
    nav.classList.remove('is-open');
  };
  toggle.addEventListener('click',() => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open ? toggle.dataset.closeLabel : toggle.dataset.openLabel);
    nav.classList.toggle('is-open',open);
  });
  nav.addEventListener('click',e => {if(e.target.closest('a')) closeMenu();});
  document.addEventListener('keydown',e => {if(e.key === 'Escape' && nav.classList.contains('is-open')) {closeMenu();toggle.focus();}});
  document.addEventListener('click',e => {if(!e.target.closest('.site-header')) closeMenu();});
  const mobile = matchMedia('(max-width: 800px)');
  mobile.addEventListener('change',()=>closeMenu());

  const scroller = document.querySelector('.panorama-scroll');
  const dialog = document.querySelector('.art-dialog');
  if(scroller) {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const artMobile = matchMedia('(max-width: 700px)');
    let artInteracted = false;
    scroller.addEventListener('pointerdown',()=>{artInteracted = true;},{once:true});
    const center = () => {scroller.scrollTo({left:artMobile.matches ? (scroller.scrollWidth-scroller.clientWidth)/2 : 0,behavior:'instant'});};
    requestAnimationFrame(center);
    window.addEventListener('load',()=>{if(!artInteracted) center();},{once:true});
    artMobile.addEventListener('change',center);
    const arrows = [...document.querySelectorAll('.scene-arrow')];
    const updateArrows = () => {
      arrows[0].disabled = scroller.scrollLeft < 4;
      arrows[1].disabled = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth-4;
    };
    arrows.forEach(button=>button.addEventListener('click',()=>{
      const width = scroller.querySelector('.art-panel').getBoundingClientRect().width;
      scroller.scrollBy({left:button.dataset.direction === 'next' ? width : -width, behavior:reducedMotion.matches ? 'instant':'smooth'});
    }));
    scroller.addEventListener('scroll',updateArrows,{passive:true});
    requestAnimationFrame(updateArrows);
    const openButton = document.querySelector('[data-open-art]');
    openButton.addEventListener('click',()=>dialog.showModal());
    document.querySelector('[data-close-art]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target === dialog) dialog.close();});
    dialog.addEventListener('close',()=>openButton.focus());
  }
})();
