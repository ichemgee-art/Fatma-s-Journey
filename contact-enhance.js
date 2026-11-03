(()=>{
 const primary=document.getElementById('contactPrimary');
 const quicklinks=document.querySelector('.contact-quicklinks');
 if(!primary||!quicklinks)return;
 const linkedin='https://www.linkedin.com/in/fatma-eltaweel-831393309';
 let professionalEmail='';
 function update(){
  const t=window.portfolioI18n?.t||((key)=>key);
  primary.textContent=t(professionalEmail?'contactEmailCta':'contactLinkedIn');
  primary.href=professionalEmail?'mailto:'+professionalEmail:linkedin;
  if(professionalEmail){primary.removeAttribute('target');primary.removeAttribute('rel');}
  else{primary.target='_blank';primary.rel='noopener noreferrer';}
  const old=quicklinks.querySelector('[data-professional-email]');
  if(old)old.remove();
  if(professionalEmail){
   const link=document.createElement('a');link.href='mailto:'+professionalEmail;
   link.textContent=professionalEmail;link.dataset.professionalEmail='';
   quicklinks.prepend(link);
  }
 }
 window.addEventListener('portfolio:language',update);
 update();
 fetch('/api/projects',{headers:{Accept:'application/json'}})
  .then(r=>{if(!r.ok)throw Error('Settings unavailable');return r.json();})
  .then(data=>{const candidate=String(data?.settings?.contactEmail||'').trim();
   if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)){professionalEmail=candidate;update();}
  }).catch(()=>{});
})();