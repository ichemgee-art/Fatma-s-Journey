(()=>{
 const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const sections=[...document.querySelectorAll('[data-studio-reveal]')];
 if(!sections.length||reduce?.matches||!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('studio-in-view');observer.unobserve(entry.target);}
 },{rootMargin:'0px 0px -45px 0px',threshold:.08});
 sections.forEach(section=>observer.observe(section));
 requestAnimationFrame(()=>document.documentElement.classList.add('studio-motion-ready'));
})();
