(() => {
 const portrait = document.querySelector('[data-portrait]');
 const certificates = document.getElementById('certificate-list');
 const status = document.getElementById('certificate-status');
 const socials = document.querySelector('.social-grid');
 const platforms = {facebook:'Facebook', instagram:'Instagram', tiktok:'TikTok', linkedin:'LinkedIn'};

 function element(tag, content, className) {
  const node = document.createElement(tag);
  if (content) node.textContent = content;
  if (className) node.className = className;
  return node;
 }

 function externalLink(url, content, className) {
  const link = element('a', content, className);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
 }

 function setStatus(key) {
  if (!status) return;
  status.dataset.i18n = key;
  status.textContent = window.portfolioI18n.t(key);
 }

 function platformKey(social) {
  if (Object.hasOwn(platforms, social.platform)) return social.platform;
  const host = new URL(social.url).hostname.toLowerCase();
  const domains = {facebook:['facebook.com','fb.com','fb.me','fb.watch'],instagram:['instagram.com'],tiktok:['tiktok.com'],linkedin:['linkedin.com','lnkd.in']};
  return Object.keys(domains).find(key => domains[key].some(domain => host === domain || host.endsWith('.' + domain)));
 }

 function renderFeatured(projects) {
  const section = document.getElementById('featured-work');
  if (!section || !Array.isArray(projects)) return;
  const byId = new Map(projects.map(project => [project.id, project]));
  const selected = projects.filter(project => project.featured === true && project.hidden !== true).slice(0,3);
  const used = new Set(selected.map(project => project.id));
  for (const id of window.portfolioI18n.featuredIds) {
   if (selected.length >= 3) break;
   const work = byId.get(id);
   if (work && !used.has(id)) { selected.push(work); used.add(id); }
  }
  for (const category of ['content','video','voice']) {
   if (selected.length >= 3) break;
   const alternate = projects.find(project => project.category === category && project.media?.length && !used.has(project.id));
   if (alternate) { selected.push(alternate); used.add(alternate.id); }
  }
  const cards = selected.slice(0,3).map((project,index) => {
   const card = window.portfolioCard(project);
   const cover = card.querySelector('.cms-cover');
   const order = element('span',String(index+1).padStart(2,'0')+' / '+String(Math.min(selected.length,3)).padStart(2,'0'),'featured-order');
   order.setAttribute('aria-hidden','true');
   cover?.append(order);
   return card;
  });
  document.getElementById('featured-grid').replaceChildren(...cards);
  section.hidden = cards.length === 0;
 }

 fetch('/api/projects').then(response => {
  if (!response.ok) throw Error('Site content unavailable');
  return response.json();
 }).then(data => {
  if (!data) return;
  const portraitKey = portrait?.dataset.portrait;
  const portraitUrl = portraitKey && data.settings?.[portraitKey];
  if (portrait && typeof portraitUrl === 'string') {
   try {
    const next = new URL(portraitUrl);
    if (next.protocol === 'https:' && next.hostname === 'cdn.sanity.io' && next.pathname.startsWith('/images/')) {
     next.searchParams.set('w','1000');
     next.searchParams.set('q','82');
     next.searchParams.set('auto','format');
     const nextUrl = next.href;
     const cachedUrl = (() => {try {return localStorage.getItem('fatma:portrait:'+portraitKey)} catch {return ''}})();
     // The visible photo stays on screen while a newer Sanity image downloads.
     if (cachedUrl !== nextUrl || portrait.getAttribute('src')?.startsWith('/api/portrait?')) {
      const nextPhoto = new Image();
      nextPhoto.decoding = 'async';
      nextPhoto.onload = () => {
       try {localStorage.setItem('fatma:portrait:'+portraitKey,nextUrl)} catch {}
       if (portrait.isConnected && portrait.src !== nextUrl) portrait.src = nextUrl;
      };
      nextPhoto.src = nextUrl;
     }
    }
   } catch {}
  }
  // Prefill the other page's image URL as well, so moving from Home to About
  // does not add the slow portrait lookup on the very first navigation.
  for (const otherKey of ['heroImage','aboutImage']) {
   if (otherKey === portraitKey) continue;
   const otherValue = data.settings?.[otherKey];
   if (typeof otherValue !== 'string') continue;
   try {
    const u = new URL(otherValue);
    if (u.protocol !== 'https:' || u.hostname !== 'cdn.sanity.io' || !u.pathname.startsWith('/images/')) continue;
    u.searchParams.set('w','1000');u.searchParams.set('q','82');u.searchParams.set('auto','format');
    try {localStorage.setItem('fatma:portrait:'+otherKey,u.href)} catch {}
   } catch {}
  }
  const originalCards = Array.from(socials?.querySelectorAll('a') || []);
  const descriptions = new Map(originalCards.map(card => [card.href, card.querySelector('[data-i18n]')?.dataset.i18n]));

  function render() {
   renderFeatured(data.projects);
   const ar = document.documentElement.lang === 'ar';
   if (certificates) {
    const cards = (data.certificates || []).map(certificate => {
     const title = ar ? certificate.titleAr || certificate.titleEn : certificate.titleEn || certificate.titleAr;
     const description = ar ? certificate.descriptionAr : certificate.descriptionEn;
     const isPdf = certificate.mimeType === 'application/pdf';
     const label = isPdf ? (ar ? 'افتح ملف PDF ↗' : 'Open PDF ↗') : (ar ? 'اعرض الشهادة ↗' : 'View certificate ↗');
     const card = element('article', '', 'certificate-card');
     const preview = externalLink(certificate.url, '', 'certificate-preview');
     preview.setAttribute('aria-label', label + ' ' + title);
     if (isPdf) {
      preview.append(window.createPDFPreview({url:certificate.url}, title));
     } else {
      const image = element('img');
      image.src = certificate.url;
      image.alt = title;
      image.loading = 'lazy';
      image.decoding = 'async';
      preview.append(image);
     }
     const body = element('div', '', 'certificate-body');
     body.append(element('h2', title));
     if (description) body.append(element('p', description));
     body.append(externalLink(certificate.url, label, 'certificate-open'));
     card.append(preview, body);
     return card;
    });
    certificates.replaceChildren(...cards);
    status.hidden = cards.length > 0;
    if (!cards.length) setStatus('certificateEmpty');
   }

   if (document.body.dataset.page === 'social' && socials) {
    const managed = data.settings?.socialsManaged;
    socials.replaceChildren(...(managed ? [] : originalCards));
    const seen = new Set(managed ? [] : originalCards.map(card => card.href));
    for (const social of data.settings?.socials || []) {
     if (seen.has(social.url)) continue;
     seen.add(social.url);
     const key = platformKey(social);
     const platform = platforms[key];
     const link = externalLink(social.url, '', 'social-card');
     link.dataset.cmsSocial = '';
     if (key) link.classList.add(key);
     const top = element('span', '', 'social-card-top');
     const icon = element('span', key ? '' : '↗', 'social-icon');
     icon.setAttribute('aria-hidden', 'true');
     if (key) {
      const logo = element('img');
      logo.src = '/assets/social/' + key + '.svg';
      logo.alt = '';
      logo.width = logo.height = 30;
      logo.loading = 'lazy';
      icon.append(logo);
     }
     const arrow = element('span', '↗', 'social-arrow');
     arrow.setAttribute('aria-hidden', 'true');
     top.append(icon, arrow);
     const heading = element('span', platform ? window.portfolioI18n.t('platform' + platform) : new URL(social.url).hostname, 'social-platform');
     heading.dir = 'auto';
     link.append(top, heading);
     if (social.label) {
      const handle = element('strong', social.label, 'social-handle');
      handle.dir = 'auto';
      link.append(handle);
     }
     const descriptionKey = descriptions.get(social.url);
     if (descriptionKey) link.append(element('p', window.portfolioI18n.t(descriptionKey)));
     link.append(element('span', ar ? 'افتح الحساب ↗' : 'Visit profile ↗', 'social-visit'));
     socials.append(link);
    }
   }
  }
  render();
  window.addEventListener('portfolio:language', render);
 }).catch(error => {
  setStatus('certificateError');
  console.error('Portfolio site content:', error);
 });
})();
