import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react'
import {useClient} from 'sanity'
import {legacyCatalog} from '../legacy-catalog.js'

/* Runs inside the owner's authenticated Sanity Studio session.
 * No API token is bundled in the website or migration tool.
 * All writes preserve existing work and are idempotent. */
const h=React.createElement
const idFor=record=>record.sanityId||'drive-'+record.id
const hasOriginalAsset=(item,doc)=>!!doc?.media?.asset?._ref||(item.type==='image'&&!!doc?.cover?.asset?._ref)
const hasArabic=value=>/[\u0600-\u06FF]/.test(String(value||''))
const filenameKey=value=>String(value||'').normalize('NFKC').toLocaleLowerCase()
 .replace(/^copy of\s+/i,'').replace(/\.(pdf|docx?|pptx?|xlsx?|mp4|mov|webm|m4v|mp3|wav|m4a|aac|ogg|flac|jpe?g|png|webp|gif|avif|heic)$/i,'')
 .replace(/[\s\u0640_.()\[\]{}-]+/g,' ').replace(/[^\p{Letter}\p{Number} ]/gu,'').replace(/\s+/g,' ').trim()
const formatFor=name=>{
 const ext=String(name||'').split('.').pop().toLowerCase()
 if(['jpg','jpeg','png','webp','gif','avif','heic'].includes(ext))return 'image'
 if(['pdf'].includes(ext))return 'pdf'
 if(['doc','docx','ppt','pptx','xls','xlsx','txt','rtf'].includes(ext))return 'document'
 if(['mp4','mov','webm','m4v','avi','mpeg'].includes(ext))return 'video'
 if(['mp3','wav','m4a','aac','ogg','flac'].includes(ext))return 'audio'
 return ''
}
const typeMatches=(fileType,itemType)=>fileType===itemType||(fileType==='document'&&itemType==='pdf')||(fileType==='pdf'&&itemType==='document')||(fileType==='video'&&itemType==='audio')||(fileType==='audio'&&itemType==='video')
const buildRecord=item=>({
 _id:idFor(item),_type:'work',
 category:item.category,group:item.group||'',type:item.type,
 title:item.title,titleEn:item.title,
 ...(hasArabic(item.title)?{titleAr:item.title}:{}),
 order:typeof item.order==='number'?item.order:999,
 hidden:false,featured:false,
 sourceDriveId:item.id,sourceDriveUrl:item.sourceUrl,
 sourceFilename:item.title,importedFromDrive:true
})
const dashboard={fontFamily:'Alexandria,Tahoma,sans-serif',direction:'rtl',lineHeight:1.95,maxWidth:1140,margin:'auto',padding:'clamp(22px,4vw,44px)'}
const card={background:'rgba(130,97,167,.06)',border:'1px solid rgba(132,109,164,.36)',padding:'18px 20px',borderRadius:18}
const btn={background:'#ddbeef',border:'1px solid #8963ac',borderRadius:12,color:'#261739',padding:'12px 18px',font:'800 13px Alexandria,Tahoma,sans-serif',cursor:'pointer',minHeight:46}
const secondary={...btn,background:'transparent',color:'inherit',borderColor:'#92819d'}
const meter=(done,total)=>h('div',{style:{height:10,background:'rgba(135,120,150,.24)',overflow:'hidden',borderRadius:99}},
 h('div',{style:{height:'100%',width:(total?Math.round(done/total*100):0)+'%',background:'#8861bc',transition:'width .2s'}}))
function matchFiles(files,overrides={}){
 const result=[]
 for(let i=0;i<files.length;i++){
  const file=files[i],manual=overrides[i]
  if(manual){const f=legacyCatalog.find(x=>x.id===manual);result.push({file,index:i,item:f||null,reason:f?'':'المعرف المختار غير صالح'});continue}
  const base=filenameKey(file.name),kind=formatFor(file.name)
  let candidates=legacyCatalog.filter(x=>file.name.includes(x.id))
  if(!candidates.length)candidates=legacyCatalog.filter(x=>filenameKey(x.title)===base)
  if(candidates.length>1&&kind){const same=candidates.filter(x=>typeMatches(kind,x.type));if(same.length)candidates=same}
  result.push({file,index:i,item:candidates.length===1?candidates[0]:null,reason:!candidates.length?'اسم غير مطابق لأي عمل':candidates.length>1?'أكثر من عمل بنفس الاسم':''})
 }
 return result
}
export function LegacyMigration(){
 const client=useClient({apiVersion:'2025-02-19'})
 const [current,setCurrent]=useState([]),[loading,setLoading]=useState(true)
 const [busy,setBusy]=useState(false),[error,setError]=useState('')
 const [log,setLog]=useState([]),[progress,setProgress]=useState({done:0,total:0})
 const [uploads,setUploads]=useState([]),[overrides,setOverrides]=useState({})
 const [showFileCount,setShowFileCount]=useState(40)
 const [search,setSearch]=useState('')
 const inputFiles=useRef(null),inputFolder=useRef(null)
 const refresh=useCallback(async()=>{
  setLoading(true);setError('')
  try{
   const docs=await client.fetch('*[_type == "work"] | order(_id asc)[0...5000]{_id,sourceDriveId,sourceDriveUrl,sourceFilename,titleAr,titleEn,media,cover}',{},{perspective:'raw'})
   setCurrent(Array.isArray(docs)?docs:[])
  }catch(e){setError('تعذّرت قراءة بيانات Sanity: '+(e?.message||''))}
  finally{setLoading(false)}
 },[client])
 useEffect(()=>{refresh()},[refresh])
 const known=useMemo(()=>{
  const byId=new Map(current.map(doc=>[doc._id,doc])),byDrive=new Map(current.filter(doc=>doc.sourceDriveId).map(doc=>[doc.sourceDriveId,doc]))
  const entries=legacyCatalog.map(file=>({file,doc:byId.get(idFor(file))||byDrive.get(file.id)||null}))
  return {entries,missing:entries.filter(x=>!x.doc),existing:entries.filter(x=>!!x.doc),uploaded:entries.filter(x=>hasOriginalAsset(x.file,x.doc))}
 },[current])
 const selected=useMemo(()=>matchFiles(uploads,overrides),[uploads,overrides])
 const itemsToUpload=selected.filter(entry=>entry.item)
 const writeLog=message=>setLog(prev=>[message,...prev].slice(0,12))
 const importRecords=async()=>{
  if(busy||loading)return
  const pending=known.missing
  const annotate=known.existing.filter(x=>!x.doc.sourceDriveId)
  const count=pending.length+annotate.length
  if(!count){writeLog('الـ260 سجل موجودين بالفعل؛ مفيش سجلات ناقصة.');return}
  if(!window.confirm('هيتم إنشاء '+pending.length+' سجل جديد وإضافة رابط المصدر لـ'+annotate.length+' سجل موجود بدون تعديل العناوين أو الملفات المرفوعة. موافق؟'))return
  setBusy(true);setError('');setProgress({done:0,total:count})
  let done=0
  try{
   const all=[...pending.map(x=>({action:'create',...x})),...annotate.map(x=>({action:'patch',...x}))]
   for(let i=0;i<all.length;i+=8){
    const chunk=all.slice(i,i+8),tx=client.transaction()
    for(const {action,file,doc} of chunk){
     if(action==='create')tx.createIfNotExists(buildRecord(file))
     else tx.patch(doc._id,p=>p.setIfMissing({sourceDriveId:file.id,sourceDriveUrl:file.sourceUrl,sourceFilename:file.title}))
    }
    await tx.commit({visibility:'async'})
    done+=chunk.length;setProgress({done,total:count})
   }
   writeLog('اكتمل إنشاء وتوثيق '+done+' سجل بدون حذف أو استبدال أي محتوى.')
  }catch(e){
   setError('توقف الاستيراد بعد '+done+' عملية. يمكنك إعادة المحاولة بأمان: '+(e?.message||''))
  }finally{await refresh();setBusy(false)}
 }
 const uploadAssets=async()=>{
  if(busy||loading)return
  const available=itemsToUpload.filter(x=>{
   const record=known.entries.find(w=>w.file.id===x.item.id)
   return !hasOriginalAsset(x.item,record?.doc)
  })
  const unique=new Set(),queue=[]
  for(const item of available)if(!unique.has(item.item.id)){unique.add(item.item.id);queue.push(item)}
  if(!queue.length){writeLog('مافيش ملفات جديدة متطابقة ومحتاجة رفع.');return}
  if(!window.confirm('هترفع '+queue.length+' ملف أصلي إلى تخزين Sanity. ده ممكن يستهلك مساحة ووقت نقل. الملف الموجود بالفعل مش هيتستبدل. تكمل؟'))return
  setBusy(true);setError('');setProgress({done:0,total:queue.length})
  let done=0,uploaded=0,failed=[]
  try{
   for(const {item,file} of queue){
    const entry=known.entries.find(x=>x.file.id===item.id)
    if(!entry?.doc){failed.push(file.name+' — استورد السجل أولًا');done++;setProgress({done,total:queue.length});continue}
    try{
     if(!file.size)throw Error('الملف فارغ')
     const image=item.type==='image'&&formatFor(file.name)==='image'
     const asset=await client.assets.upload(image?'image':'file',file,{filename:file.name})
     const reference={_type:'reference',_ref:asset._id}
     const patch=image?{cover:{_type:'image',asset:reference}}:{media:{_type:'file',asset:reference}}
     await client.patch(entry.doc._id).setIfMissing(patch).commit({visibility:'async'})
     uploaded++
    }catch(e){failed.push(file.name+' — '+(e?.message||'فشل الرفع'))}
    done++;setProgress({done,total:queue.length})
   }
   writeLog('اترفع '+uploaded+' ملف إلى Sanity. '+(failed.length?'تعذّر '+failed.length+' ملف.':'كل الملفات المطابقة تم رفعها.'))
   if(failed.length)setError(failed.slice(0,15).join(' | '))
  }finally{await refresh();setBusy(false)}
 }
 const filtered=known.entries.filter(x=>!search||x.file.title.toLocaleLowerCase().includes(search.toLocaleLowerCase())||x.file.id.includes(search))
 return h('main',{dir:'rtl',lang:'ar',style:dashboard},
  h('div',{style:{display:'flex',gap:18,alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap'}},
   h('div',null,h('p',{style:{fontWeight:800,fontSize:12,color:'#9e6cc7'}},'FATMA’S JOURNEY / SANITY MIGRATION'),
    h('h1',{style:{fontSize:'clamp(25px,3.4vw,39px)',lineHeight:1.6,margin:'0 0 8px'}},'نقل 260 عمل إلى Sanity'),
    h('p',{style:{maxWidth:810,fontSize:14,opacity:.85,margin:'0 0 18px'}},'مرحلتين واضحتين: أولًا إنشاء سجلات قابلة للتعديل لكل الأعمال بدون تكرار، وبعدها رفع الملفات الأصلية إلى تخزين Sanity على دفعات. أي ملف موجود بالفعل هيفضل كما هو.')),
   h('button',{type:'button',disabled:busy||loading,onClick:refresh,style:secondary},loading?'جارٍ الفحص…':'تحديث الأرقام ↻')
  ),
  h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))',gap:12,margin:'18px 0 26px'}},
   ...[[260,'ملف في الكتالوج'],[known.existing.length,'موجود داخل Sanity'],[known.missing.length,'بحاجة لسجل'],[known.uploaded.length,'ملف أصلي مرفوع']].map(([count,label])=>
    h('div',{key:label,style:card},h('strong',{style:{display:'block',fontSize:30,lineHeight:1.4}},count),h('span',{style:{fontSize:12,opacity:.8}},label)))
  ),
  error&&h('p',{role:'alert',style:{background:'rgba(180,38,62,.15)',borderRadius:12,padding:13,fontSize:13}},error),
  h('section',{style:{...card,marginBottom:18}},
   h('h2',{style:{fontSize:21,margin:'0 0 6px'}},'1 — إضافة سجلات الـ260 عمل'),
   h('p',{style:{fontSize:13,opacity:.82,margin:'0 0 16px'}},'يتم استيراد الاسم والقسم والترتيب ورابط Google Drive في Sanity. المستندات المنشورة الحالية لا يتم حذفها أو استبدالها، وبتفضل بياناتها مترجمة كما هي.'),
   h('button',{type:'button',style:btn,onClick:importRecords,disabled:busy||loading||(!known.missing.length&&!known.existing.some(x=>!x.doc.sourceDriveId))},
    busy?'جارٍ التنفيذ…':known.missing.length?'استيراد '+known.missing.length+' سجل ناقص':'مراجعة وربط المصادر'),
   h('p',{style:{fontSize:12,opacity:.75,margin:'13px 0 0'}},'تنبيه: استيراد السجلات لا يرفع الملفات الثنائية نفسها. روابط Drive القديمة تفضل شغالة لحد رفع الأصول إلى Sanity.')
  ),
  h('section',{style:{...card,marginBottom:18}},
   h('h2',{style:{fontSize:21,margin:'0 0 6px'}},'2 — رفع الملفات الأصلية إلى Sanity دفعة واحدة'),
   h('p',{style:{fontSize:13,opacity:.82,margin:'0 0 14px'}},'اختار ملفاتك أو مجلد Google Drive اللي عندك على الكمبيوتر. هنحاول نطابق كل ملف باسمه الأصلي ونتجاهل الملفات التي تم رفعها بالفعل. الملفات غير المطابقة لا تُرفع عشوائيًا.'),
   h('div',{style:{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}},
    h('button',{type:'button',style:secondary,onClick:()=>inputFiles.current?.click(),disabled:busy},'اختيار ملفات متعددة'),
    h('button',{type:'button',style:secondary,onClick:()=>inputFolder.current?.click(),disabled:busy},'اختيار مجلد كامل'),
    h('input',{ref:inputFiles,type:'file',multiple:true,style:{display:'none'},onChange:e=>{setUploads(Array.from(e.target.files||[]));setOverrides({});setShowFileCount(40)}}),
    h('input',{ref:inputFolder,type:'file',webkitdirectory:'',directory:'',multiple:true,style:{display:'none'},onChange:e=>{setUploads(Array.from(e.target.files||[]));setOverrides({});setShowFileCount(40)}})
   ),
   h('p',{style:{fontSize:13,fontWeight:750,margin:'15px 0'}},uploads.length+' ملف مختار · '+itemsToUpload.length+' مطابق · '+(uploads.length-itemsToUpload.length)+' يحتاج ربط'),
   !!selected.length&&h('div',{style:{maxHeight:300,overflow:'auto',border:'1px solid #a28baa55',borderRadius:12}},
    ...selected.slice(0,showFileCount).map(({file,item,reason,index})=>
     h('div',{key:index,style:{display:'grid',gridTemplateColumns:'minmax(160px,1fr) minmax(170px,1fr)',gap:10,alignItems:'center',padding:'9px 13px',borderBottom:'1px solid #a28baa33',fontSize:12}},
      h('span',{title:file.name,style:{overflowWrap:'anywhere'}},file.name),
      h('div',{style:{display:'flex',gap:7,alignItems:'center',minWidth:0}},
       h('select',{value:overrides[index]||item?.id||'',disabled:busy,style:{width:'100%',minWidth:0,border:'1px solid #9975b5',borderRadius:9,padding:'7px 6px',background:'transparent',color:'inherit'},
        onChange:e=>setOverrides(previous=>({...previous,[index]:e.target.value}))},
        h('option',{value:''},reason||'اختيار عمل…'),
        ...legacyCatalog.map(f=>h('option',{key:f.id,value:f.id},f.title+' · '+f.category))
       )
      )
     )
    )
   ),
   selected.length>showFileCount&&h('button',{type:'button',disabled:busy,onClick:()=>setShowFileCount(n=>n+40),style:{...secondary,marginTop:10}},'عرض ملفات إضافية ('+Math.min(showFileCount,selected.length)+' / '+selected.length+')'),
   h('button',{type:'button',disabled:busy||loading||!known.existing.length||!itemsToUpload.length,onClick:uploadAssets,style:{...btn,marginTop:14}},'رفع '+itemsToUpload.length+' ملف مطابق'),
   h('p',{style:{fontSize:12,opacity:.75,margin:'12px 0 0'}},'رفع الفيديوهات الكبيرة يعتمد على حدود Sanity وسعة التخزين والإنترنت. يمكن إعادة التشغيل بدون حذف أو استبدال الملفات التي تم رفعها.')
  ),
  busy&&h('section',{role:'status',style:{...card,marginBottom:18}},
   h('p',{style:{fontSize:14,margin:'0 0 10px'}},'التقدم: '+progress.done+' من '+progress.total),meter(progress.done,progress.total)
  ),
  h('section',{style:{...card,marginBottom:18}},
   h('h2',{style:{fontSize:19,margin:'0 0 8px'}},'حالة الأعمال في الكتالوج'),
   h('input',{type:'search',value:search,onChange:e=>setSearch(e.target.value),placeholder:'ابحث باسم العمل أو Drive ID',style:{width:'100%',fontSize:14,minHeight:44,border:'1px solid #a38bae',padding:'10px 14px',borderRadius:10,marginBottom:12,background:'transparent',color:'inherit'}}),
   h('div',{style:{maxHeight:260,overflow:'auto'}},
    ...filtered.slice(0,260).map(({file,doc})=>h('div',{key:file.id,style:{display:'flex',alignItems:'center',gap:10,justifyContent:'space-between',borderBottom:'1px solid #9994a22d',padding:'7px 0',fontSize:12}},
     h('span',{style:{overflowWrap:'anywhere'}},file.title+' · '+file.category),
     h('span',{style:{whiteSpace:'nowrap',fontWeight:700,color:doc?'#638b47':'#ad7a52'}},doc?(hasOriginalAsset(file,doc)?'أصل مرفوع':'سجل موجود'):'ناقص')
    ))
   )
  ),
  !!log.length&&h('section',{style:card},h('h3',{style:{fontSize:17,margin:'0 0 8px'}},'آخر العمليات'),...log.map((message,i)=>h('p',{key:i,style:{fontSize:12,margin:'5px 0'}},message))),
  h('p',{style:{fontSize:12,opacity:.75,margin:'20px 0'}},'العملية قابلة للاستئناف وآمنة على سجلات Sanity الموجودة. عدم توافر صلاحية الكتابة يظهر كخطأ واضح، ومش هنطلب منك مشاركة أي API Token هنا.')
 )
}
