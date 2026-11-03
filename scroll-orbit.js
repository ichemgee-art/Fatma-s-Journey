(() => {
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 const orbit = document.createElement('div');
 orbit.className = 'scroll-orbit';
 orbit.setAttribute('aria-hidden', 'true');
 orbit.innerHTML = '<div class="scroll-orbit-drift"><div class="scroll-orbit-model"><span class="scroll-orbit-core"></span><span class="scroll-orbit-band"></span><span class="scroll-orbit-band"></span></div></div>';

 let frame = 0;
 let current = window.scrollY;
 let target = current;

 function draw() {
  const distance = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const progress = distance ? Math.max(0, Math.min(1, current / distance)) : 0;
  const x = 25 + Math.sin(current * 0.005) * 27;
  const y = current * 0.42;
  const lift = -Math.min(120, innerHeight * 0.14) * progress + Math.sin(current * 0.007) * 12;
  orbit.classList.toggle('is-active', distance > 0 && current > 18);
  orbit.style.setProperty('--orbit-x', x + 'deg');
  orbit.style.setProperty('--orbit-y', y + 'deg');
  orbit.style.setProperty('--orbit-counter-x', -x + 'deg');
  orbit.style.setProperty('--orbit-counter-y', -y + 'deg');
  orbit.style.setProperty('--orbit-lift', lift + 'px');
 }

 function tick() {
  frame = 0;
  const delta = target - current;
  current = Math.abs(delta) < 0.4 ? target : current + delta * 0.16;
  draw();
  if (current !== target) frame = requestAnimationFrame(tick);
 }

 function update() {
  if (motion.matches || document.hidden) return;
  target = Math.max(0, window.scrollY);
  if (!frame) frame = requestAnimationFrame(tick);
 }

 function sync() {
  cancelAnimationFrame(frame);
  frame = 0;
  if (motion.matches) {
   orbit.remove();
   return;
  }
  if (!orbit.isConnected) document.body.append(orbit);
  current = target = Math.max(0, window.scrollY);
  draw();
 }

 addEventListener('scroll', update, {passive:true});
 addEventListener('resize', update, {passive:true});
 addEventListener('pageshow', sync);
 document.addEventListener('visibilitychange', sync);
 motion.addEventListener('change', sync);
 sync();
})();
