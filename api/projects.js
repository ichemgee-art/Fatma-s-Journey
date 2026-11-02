// Public portfolio data from Sanity Content Lake.
// Private datasets require SANITY_READ_TOKEN set as a server-only Vercel secret.
const projectId = process.env.SANITY_PROJECT_ID || 'q3zqgei4';
const dataset = process.env.SANITY_DATASET || 'production';
const query = [
'{ "projects": *[_type in ["portfolioProject","project","portfolioItem","work","caseStudy"] && !(_id in path("drafts.**"))] | order(coalesce(order,priority,999) asc,_createdAt desc)[0...80]{',
'_id,_type,title,name,slug,summary,excerpt,description,category,categories,service,client,role,year,featured,',
'"coverUrl":coalesce(cover.asset->url,coverImage.asset->url,mainImage.asset->url,thumbnail.asset->url,image.asset->url),',
'"images":images[]{"url":asset->url,alt,caption},',
'"gallery":gallery[]{_type,"url":coalesce(asset->url,image.asset->url,file.asset->url,url),"poster":poster.asset->url,caption,title},',
'"media":media[]{_type,kind,"url":coalesce(asset->url,image.asset->url,file.asset->url,url,videoUrl,externalUrl),"poster":poster.asset->url,caption,title},',
'"videos":videos[]{_type,"url":coalesce(asset->url,file.asset->url,url,videoUrl,externalUrl),"poster":poster.asset->url,title},',
'"files":files[]{"url":coalesce(asset->url,file.asset->url,url),title},',
'"videoUrl":coalesce(videoUrl,video.url,video.file.asset->url,video.asset->url)',
'}, "settings": *[_type in ["siteSettings","portfolioSettings"]][0]{name,headline,tagline,about,contactEmail,"heroImage":heroImage.asset->url,"socials":socials[]{label,url}} }'
].join('');
function txt(v) {
 if (typeof v === 'string') return v.trim();
 if (typeof v === 'number') return String(v);
 if (v && typeof v.current === 'string') return v.current;
 if (Array.isArray(v)) return v.filter(b=>b?._type==='block').map(b=>(b.children||[]).map(c=>c.text||'').join('')).join(' ');
 return '';
}
function url(v) {
 if(typeof v!=='string')return '';
 try {const u=new URL(v);return u.protocol==='https:'?u.href:'';}catch{return '';}
}
function category(v) {
 const s=txt(Array.isArray(v)?v[0]:v).toLowerCase();
 if(/plan|strateg|خطة|استراتيج/.test(s))return 'plans';
 if(/dubb|دبلج/.test(s))return 'dubbing';
 if(/voice|narrat|فويس|تعليق صوت/.test(s))return 'voice';
 if(/(^|[^a-z])ai([^a-z]|$)|ذكاء|artificial/.test(s))return 'ai';
 if(/photo|تصوير/.test(s))return 'photo';
 return 'reels';
}
function media(v,hint) {
 const x=typeof v==='string'?{url:v}:v||{};
 const link=url(x.url||x.externalUrl||x.videoUrl);
 if(!link)return null;
 const k=x._type||x.kind||hint||'';
 const video=/video|file/i.test(k)||/\.(mp4|webm|mov|m4v)(\?|$)/i.test(link)||/(youtube\.com|youtu\.be|vimeo\.com)/.test(new URL(link).hostname);
 return {url:link,type:video?'video':'image',title:txt(x.caption||x.alt||x.title).slice(0,200),poster:url(x.poster)};
}
function format(p) {
 const sources=[[p.coverUrl,'image'],[p.images,'image'],[p.gallery,''],[p.media,''],[p.videos,'video'],[p.files,'video'],[p.videoUrl,'video']];
 const items=[];
 for(const [s,h] of sources){for(const v of Array.isArray(s)?s:[s]){const m=media(v,h);if(m&&!items.some(i=>i.url===m.url))items.push(m);}}
 return {id:txt(p._id),slug:txt(p.slug),title:txt(p.title||p.name).slice(0,200),category:category(p.category||p.categories||p.service),summary:txt(p.summary||p.excerpt||p.description).slice(0,500),client:txt(p.client).slice(0,120),role:txt(p.role).slice(0,120),year:txt(p.year).slice(0,8),featured:p.featured===true,cover:items.find(i=>i.type==='image')?.url||'',media:items.slice(0,50)};
}
module.exports=async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 if(!/^[a-z0-9]+$/.test(projectId)||!/^[a-z0-9][a-z0-9_-]*$/.test(dataset)){return res.status(500).json({error:'Invalid Sanity configuration'});}
 try{
  const endpoint=new URL('https://'+projectId+'.api.sanity.io/v2025-02-19/data/query/'+dataset);
  endpoint.searchParams.set('query',query);
  const headers={Accept:'application/json'};
  if(process.env.SANITY_READ_TOKEN)headers.Authorization='Bearer '+process.env.SANITY_READ_TOKEN;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9500);
  let response;
  try{response=await fetch(endpoint,{headers,signal:controller.signal});}finally{clearTimeout(timer);}
  if(!response.ok)throw new Error('Sanity HTTP '+response.status);
  const payload=await response.json();
  if(payload.error)throw new Error('Sanity query failed');
  const raw=payload.result||{},settings=raw.settings||{};
  const projects=(Array.isArray(raw.projects)?raw.projects:[]).map(format).filter(p=>p.title);
  const contactEmail=txt(settings.contactEmail);
  res.setHeader('Cache-Control','s-maxage=30,stale-while-revalidate=120');
  return res.status(200).json({projects,count:projects.length,settings:{name:txt(settings.name),headline:txt(settings.headline),tagline:txt(settings.tagline),about:txt(settings.about),heroImage:url(settings.heroImage),contactEmail:/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail)?contactEmail:'',socials:(settings.socials||[]).map(x=>({label:txt(x.label),url:url(x.url)})).filter(x=>x.url)}});
 }catch(e){
  console.error('Sanity query failed:',e.message);
  res.setHeader('Cache-Control','no-store');
  return res.status(503).json({error:'Unable to read published Sanity content. Check dataset access and Vercel configuration.'});
 }
};