const catalog = require('../data/portfolio-catalog.json');
const categories = ['content','photo','voice','video','dubbing','ai'];
const projectId = process.env.SANITY_PROJECT_ID || 'q3zqgei4';
const dataset = process.env.SANITY_DATASET || 'production';
const projection = '_type,kind,title,caption,alt,"url":coalesce(asset->url,image.asset->url,file.asset->url,url,externalUrl,videoUrl),"mimeType":coalesce(asset->mimeType,file.asset->mimeType),"poster":poster.asset->url';
const query = '{"projects":*[_type in ["work","portfolioProject","project","portfolioItem","caseStudy"] && !(_id in path("drafts.**"))] | order(coalesce(order,priority,999) asc,_createdAt desc,_id asc){_id,_type,title,name,titleAr,titleEn,summaryAr,summaryEn,textAr,textEn,clientAr,clientEn,roleAr,roleEn,category,group,type,hidden,order,summary,description,text,client,role,year,"coverUrl":coalesce(cover.asset->url,coverImage.asset->url,image.asset->url),"singleMedia":select(_type=="work"=>media{'+projection+'}),"media":select(_type!="work"=>media[]{'+projection+'}),"gallery":gallery[]{'+projection+'},"images":images[]{'+projection+'},"files":files[]{'+projection+'},"audio":audio[]{'+projection+'},"videos":videos[]{'+projection+'},videoUrl},"settings":*[_type in ["siteSettings","portfolioSettings"] && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(_updatedAt desc,_id asc)[0]{name,headline,tagline,about,contactEmail,"heroImage":heroImage.asset->url,"aboutImage":aboutImage.asset->url,socials[]{label,platform,url}},"socialSettings":*[_id=="socialSettings"][0]{socials[]{label,platform,url}},"certificates":*[_type=="certificate" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(_createdAt desc,_id asc){titleAr,titleEn,descriptionAr,descriptionEn,"url":attachment.asset->url,"mimeType":attachment.asset->mimeType}}';
function text(v){return typeof v==='string'?v.trim():'';}
function safeUrl(v){try{const u=new URL(v);return u.protocol==='https:'?u.href:'';}catch{return '';}}
function category(v){const aliases={plans:'content',reels:'video',photography:'photo'};return categories.includes(v)?v:aliases[v]||'';}
function media(v,hint){
 if(!v)return null;const x=typeof v==='string'?{url:v}:v;const url=safeUrl(x.url);if(!url)return null;
 const kind=x.kind||x.mimeType||hint||x._type||'';
 const type=/audio/i.test(kind)||/\.(mp3|wav|m4a|aac|ogg)([?#]|$)/i.test(url)?'audio':/pdf/i.test(kind)||/\.pdf([?#]|$)/i.test(url)?'pdf':/document|word/i.test(kind)||/\.docx?([?#]|$)/i.test(url)?'document':/video/i.test(kind)||/\.(mp4|webm|mov|m4v)([?#]|$)/i.test(url)||/youtu|vimeo/.test(new URL(url).hostname)?'video':'image';
 return {url,type,title:text(x.caption||x.title||x.alt),poster:safeUrl(x.poster)};
}
function normalize(p){
 const items=[];
 for(const [values,hint] of [[p.singleMedia,p.type],[p.media,''],[p.gallery,''],[p.images,'image'],[p.files,'document'],[p.audio,'audio'],[p.videos,'video'],[p.videoUrl,'video']]){
  for(const x of Array.isArray(values)?values:[values]){const m=media(x,hint);if(m&&!items.some(i=>i.url===m.url))items.push(m);}
 }
 if(!items.length&&p.coverUrl)items.push(media({url:p.coverUrl},'image'));
 const translations={en:{},ar:{}},legacyText={title:text(p.title||p.name),summary:text(p.summary||p.description),text:text(p.text),client:text(p.client),role:text(p.role)};
 for(const key of ['title','summary','text','client','role'])for(const [lang,suffix] of [['en','En'],['ar','Ar']])translations[lang][key]=text(p[key+suffix]);
 return {id:p._id,title:text(p.titleEn||p.titleAr||p.title||p.name),type:text(p.type)||((p.text||p.textEn||p.textAr)?'document':''),category:category(p.category),group:text(p.group),summary:text(p.summaryEn||p.summaryAr||p.summary||p.description),text:text(p.textEn||p.textAr||p.text),client:text(p.clientEn||p.clientAr||p.client),role:text(p.roleEn||p.roleAr||p.role),translations,legacyText,year:text(p.year),customCover:!!safeUrl(p.coverUrl),cover:safeUrl(p.coverUrl)||items.find(m=>m?.type==='image')?.url||'',media:items.filter(Boolean),hidden:p.hidden===true};
}
function fromDrive(f){
 return {id:'drive-'+f.id,driveId:f.id,title:f.title,category:f.category,group:f.group,summary:'',text:'',sourceUrl:f.sourceUrl,
 cover:['image','video','pdf'].includes(f.type)?'https://drive.google.com/thumbnail?id='+f.id+'&sz=w640':'',
 media:[{type:f.type,provider:'drive',driveId:f.id,url:'https://drive.google.com/file/d/'+f.id+'/preview',title:f.title}]};
}
function assemble(raw={}){
 const docs=Array.isArray(raw.projects)?raw.projects:[],byId=new Map(docs.map(p=>[p._id,p]));
 const used=new Set(),projects=[];
 for(const f of catalog.files){
  const p=byId.get(f.sanityId);if(p)used.add(p._id);
  if(p?.hidden===true)continue;
  const fallback=fromDrive(f),live=p?normalize(p):null;
  projects.push(live?{...fallback,...live,category:live.category||f.category,group:live.group,cover:live.cover||fallback.cover,media:live.media.length?live.media:fallback.media}:fallback);
 }
 const added=[];for(const p of docs){if(!used.has(p._id)&&p.hidden!==true){const n=normalize(p);if(n.title&&n.category)added.push(n);}}
 const s=raw.settings||{};
 const certificates=(raw.certificates||[]).map(c=>({
  titleAr:text(c.titleAr),titleEn:text(c.titleEn),
  descriptionAr:text(c.descriptionAr),descriptionEn:text(c.descriptionEn),
  url:safeUrl(c.url),mimeType:text(c.mimeType)
 })).filter(c=>c.url&&(c.titleAr||c.titleEn)&&(c.mimeType==='application/pdf'||c.mimeType.startsWith('image/')));
 const socials=((raw.socialSettings ? raw.socialSettings.socials : s.socials)||[]).filter(Boolean).map(link=>({
  label:text(link.label),platform:text(link.platform),url:safeUrl(link.url)
 })).filter(link=>link.url);
 return {projects:[...added,...projects],count:added.length+projects.length,mediaLibrary:[],certificates,settings:{name:text(s.name),headline:text(s.headline),tagline:text(s.tagline),about:text(s.about),heroImage:safeUrl(s.heroImage),contactEmail:/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.contactEmail||'')?s.contactEmail:'',aboutImage:safeUrl(s.aboutImage),socialsManaged:!!raw.socialSettings,socials}};
}
async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 let raw={},sourceStatus='unavailable';
 if(/^[a-z0-9]+$/.test(projectId)&&/^[a-z0-9][a-z0-9_-]*$/.test(dataset)){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
  try{
   const endpoint=new URL('https://'+projectId+'.api.sanity.io/v2025-02-19/data/query/'+dataset);endpoint.searchParams.set('query',query);
   const headers={Accept:'application/json'};if(process.env.SANITY_READ_TOKEN)headers.Authorization='Bearer '+process.env.SANITY_READ_TOKEN;
   const response=await fetch(endpoint,{headers,signal:controller.signal});if(!response.ok)throw Error('Sanity HTTP '+response.status);
   const payload=await response.json();if(payload.error)throw Error('Sanity query failed');raw=payload.result||{};sourceStatus='connected';
  }catch(e){console.error('Portfolio content:',e.message);}finally{clearTimeout(timer);}
 }
 res.setHeader('Cache-Control',sourceStatus==='connected'?'s-maxage=30,stale-while-revalidate=120':'no-store');
 if(sourceStatus!=='connected')return res.status(503).json({error:'The portfolio is temporarily unavailable.'});
 const result=assemble(raw),ids=new URL(req.url||'/','https://portfolio.local').searchParams.getAll('id');
 if(ids.length){
  if(ids.length!==1||!/^[A-Za-z0-9._-]{1,200}$/.test(ids[0]))return res.status(400).json({error:'Invalid work ID'});
  const project=result.projects.find(p=>p.id===ids[0]);
  if(!project)return res.status(404).json({error:'Work not found'});
  return res.status(200).json({project,related:result.projects.filter(p=>p.id!==project.id&&p.category===project.category).slice(0,4)});
 }
 return res.status(200).json({...result,sourceStatus});
}
module.exports=handler;
module.exports.assemble=assemble;
module.exports.query=query;
