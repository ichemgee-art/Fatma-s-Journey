(() => {
 const orb = document.querySelector('.home-page .orb');
 if (!orb || !orb.parentElement) return;
 const canvas = document.createElement('canvas');
 const context = canvas.getContext('2d');
 if (!context) return;
 orb.append(canvas);

 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const pointer = matchMedia('(hover: hover) and (pointer: fine)');
 const paths = [];
 for (let ribbon = 0; ribbon < 3; ribbon++) {
  const points = [];
  for (let step = 0; step <= 72; step++) {
   const angle = step / 72 * Math.PI * 2;
   const latitude = 0.24 + 0.46 * Math.sin(angle * 2 + ribbon * 2.1);
   const longitude = angle + ribbon * Math.PI * 2 / 3;
   points.push([
    Math.cos(latitude) * Math.cos(longitude),
    Math.sin(latitude),
    Math.cos(latitude) * Math.sin(longitude),
   ]);
  }
  paths.push(points);
 }

 let visible = false;
 let frame = 0;
 let previous = 0;
 let spin = 0.45;
 let tiltX = 0;
 let tiltY = 0;
 let targetX = 0;
 let targetY = 0;

 function draw() {
  const size = canvas.width;
  if (!size) return;
  const center = size / 2;
  const radius = center * 0.94;
  const yaw = spin + tiltY;
  const pitch = -0.34 + tiltX;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cx = Math.cos(pitch), sx = Math.sin(pitch);
  context.clearRect(0, 0, size, size);
  context.lineCap = 'round';

  for (const path of paths) {
   let last;
   for (const [x, y, z] of path) {
    const depth = z * cy - x * sy;
    const rotatedDepth = y * sx + depth * cx;
    const scale = radius / (1.15 - 0.15 * rotatedDepth);
    const point = [center + (x * cy + z * sy) * scale, center + (y * cx - depth * sx) * scale];
    if (last) {
     const light = Math.max(0, rotatedDepth);
     context.strokeStyle = 'rgba(255,241,255,' + (0.08 + light * 0.73) + ')';
     context.lineWidth = size * (0.006 + light * 0.012);
     context.beginPath();
     context.moveTo(...last);
     context.lineTo(...point);
     context.stroke();
    }
    last = point;
   }
  }
 }

 function tick(now) {
  frame = 0;
  const elapsed = previous ? Math.min(40, now - previous) : 0;
  previous = now;
  spin += elapsed * 0.00062;
  const easing = 1 - Math.exp(-elapsed / 115);
  tiltX += (targetX - tiltX) * easing;
  tiltY += (targetY - tiltY) * easing;
  draw();
  sync();
 }

 function sync() {
  if (visible && !document.hidden && !reduced.matches) {
   if (!frame) frame = requestAnimationFrame(tick);
  } else {
   cancelAnimationFrame(frame);
   frame = 0;
   previous = 0;
  }
 }

 function resize() {
  const size = Math.round(orb.clientWidth * Math.min(devicePixelRatio || 1, 2));
  if (canvas.width !== size || canvas.height !== size) {
   canvas.width = canvas.height = size;
   draw();
  }
 }
 resize();
 new ResizeObserver(resize).observe(orb);
 new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  orb.toggleAttribute('data-offscreen', !visible);
  sync();
 }).observe(orb);

 orb.parentElement.addEventListener('pointermove', event => {
  if (reduced.matches || !pointer.matches || event.pointerType === 'touch') return;
  const bounds = orb.parentElement.getBoundingClientRect();
  targetX = (0.5 - (event.clientY - bounds.top) / bounds.height) * 0.64;
  targetY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.86;
 });
 orb.parentElement.addEventListener('pointerleave', () => {targetX = targetY = 0;});
 document.addEventListener('visibilitychange', sync);
 reduced.addEventListener('change', sync);
})();
