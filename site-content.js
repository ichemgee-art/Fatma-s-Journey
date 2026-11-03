(() => {
 const portrait = document.querySelector('[data-portrait]');
 const certificates = document.getElementById('certificates');
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

 fetch('/api/projects').then(response => {
  if (!response.ok) return null;
  return response.json();
 }).then(data => {
  if (!data) return;
  const portraitUrl = portrait && data.settings?.[portrait.dataset.portrait];
  if (portraitUrl) portrait.src = portraitUrl;
  const existingLinks = new Set(Array.from(socials?.querySelectorAll('a') || [], link => link.href));

  function render() {
   const ar = document.documentElement.lang === 'ar';
   if (certificates && data.certificates?.length) {
    document.getElementById('certificates-title').textContent = ar ? 'الشهادات' : 'Certificates';
    const cards = data.certificates.map(certificate => {
     const title = ar ? certificate.titleAr || certificate.titleEn : certificate.titleEn || certificate.titleAr;
     const description = ar ? certificate.descriptionAr : certificate.descriptionEn;
     const card = element('article', '', 'social-card');
     const link = externalLink(certificate.url, '', 'social-visit');
     if (certificate.mimeType.startsWith('image/')) {
      const image = element('img');
      image.src = certificate.url;
      image.alt = '';
      image.loading = 'lazy';
      image.style.cssText = 'display:block;width:100%;aspect-ratio:16/10;object-fit:contain';
      link.append(image);
     }
     link.append(element('span', certificate.mimeType === 'application/pdf' ? (ar ? 'افتح PDF ↗' : 'Open PDF ↗') : (ar ? 'اعرض الشهادة ↗' : 'View certificate ↗')));
     link.setAttribute('aria-label', link.textContent + ' ' + title);
     card.append(element('h3', title));
     if (description) card.append(element('p', description));
     card.append(link);
     return card;
    });
    document.getElementById('certificate-list').replaceChildren(...cards);
    certificates.hidden = false;
   }

   if (document.body.dataset.page === 'social' && socials) {
    socials.querySelectorAll('[data-cms-social]').forEach(link => link.remove());
    const seen = new Set(existingLinks);
    for (const social of data.settings?.socials || []) {
     if (seen.has(social.url)) continue;
     seen.add(social.url);
     const platform = Object.hasOwn(platforms, social.platform) ? platforms[social.platform] : '';
     const link = externalLink(social.url, '', 'social-card');
     link.dataset.cmsSocial = '';
     if (platform) link.classList.add(social.platform);
     link.append(element('strong', social.label || platform || new URL(social.url).hostname, 'social-handle'));
     if (social.label && platform) link.append(element('span', platform, 'social-platform'));
     link.append(element('span', ar ? 'افتح الحساب ↗' : 'Visit profile ↗', 'social-visit'));
     socials.append(link);
    }
   }
  }
  render();
  window.addEventListener('portfolio:language', render);
 }).catch(error => console.error('Portfolio site content:', error));
})();
