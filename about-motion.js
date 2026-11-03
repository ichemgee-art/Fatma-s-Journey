(() => {
 const mark = document.querySelector('.about-monogram');
 if (!mark) return;
 const story = mark.closest('.about-story');
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 let frame = 0;

 function render() {
  frame = 0;
  if (motion.matches) return;
  const bounds = story.getBoundingClientRect();
  if (bounds.bottom < 0 || bounds.top > innerHeight) return;
  const progress = Math.max(0, Math.min(1, (innerHeight - bounds.top) / (innerHeight + bounds.height)));
  mark.style.setProperty('--fj-shift', ((progress - .5) * 70) + 'px');
  mark.style.setProperty('--fj-x', (-24 + progress * 25) + 'deg');
  mark.style.setProperty('--fj-y', (-48 + progress * 72) + 'deg');
 }

 function queue() {
  if (!frame && !motion.matches) frame = requestAnimationFrame(render);
 }
 addEventListener('scroll', queue, {passive:true});
 addEventListener('resize', queue, {passive:true});
 addEventListener('pageshow', queue);
 motion.addEventListener('change', () => {
  if (motion.matches) mark.removeAttribute('style');
  else queue();
 });
 queue();
})();
