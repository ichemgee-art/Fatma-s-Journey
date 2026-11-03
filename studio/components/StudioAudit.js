import React,{useCallback,useEffect,useState} from 'react'
import {useClient} from 'sanity'
import {categoryTitle} from '../sections.js'
import {validateGroup} from '../validation.js'

const h=React.createElement
const groq=`{
 "works":*[_type=="work" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))][0...5000]{
  _id,_updatedAt,category,group,type,title,titleAr,titleEn,summary,summaryAr,summaryEn,text,textAr,textEn,
  roleAr,roleEn,year,order,featured,hidden,sourceDriveId,sourceDriveUrl,importedFromDrive,"hasMedia":defined(media.asset._ref),
  "mimeType":media.asset->mimeType,"hasCover":defined(cover.asset._ref)
 },
 "legacy":count(*[_type in ["portfolioProject","project","portfolioItem","caseStudy"] && !(_id in path("drafts.**"))]),
 "settings":*[_type=="siteSettings" && !(_id in path("drafts.**"))]{_id,_updatedAt,name,headline,tagline,about,contactEmail,"hero":defined(heroImage.asset._ref),"aboutPhoto":defined(aboutImage.asset._ref)},
 "social":*[_id=="socialSettings"][0]{socials[]{label,platform,url}},
 "certificates":*[_type=="certificate" && !(_id in path("drafts.**"))]{_id,titleAr,titleEn,"file":defined(attachment.asset._ref)},
 "drafts":count(*[_id in path("drafts.**") && _type=="work"])
}`
const present=value=>typeof value==='string'&&value.trim().length>0
const design={fontFamily:'"Alexandria",Tahoma,sans-serif',lineHeight:1.9,direction:'rtl',color:'inherit',maxWidth:1150,padding:'clamp(20px,4vw,44px)',margin:'auto'}
const panel={border:'1px solid rgba(120,108,142,.27)',background:'rgba(117,83,150,.04)',borderRadius:19,padding:'20px 23px'}
const action={cursor:'pointer',minHeight:43,border:'1px solid #8655a7',borderRadius:12,background:'#d7b5f0',color:'#241934',padding:'9px 19px',font:'700 13px Alexandria,Tahoma,sans-serif'}
function title(record){return [record.titleAr,record.titleEn,record.title].find(present)||record._id}
function buildReport(raw){
 const works=raw.works||[],visible=works.filter(w=>!w.hidden),issues=[],counts={}
 const add=(id,severity,label,items,help)=>{
  if(!items.length)return
  issues.push({id,severity,label,items:items.slice(0,8),count:items.length,help})
 }
 const categoryIds=new Set(['content','photo','voice','video','dubbing','ai'])
 const missing=(key)=>visible.filter(w=>!present(w[key]))
 add('titles-ar','error','عنوان عربي ناقص',missing('titleAr'),'اكتبي اسمًا عربيًا واضحًا لكل عمل؛ الاسم الإنجليزي ليس بديلًا عن الترجمة.')
 add('titles-en','error','عنوان إنجليزي ناقص',missing('titleEn'),'يُفضل إضافة ترجمة إنجليزية كاملة بدل ظهور النص العربي عند اختيار English.')
 add('summaries-ar','warning','وصف عربي ناقص',missing('summaryAr'),'سطران يشرحان الفكرة ودور فاطمة يرفعان جودة العرض.')
 add('summaries-en','warning','وصف إنجليزي ناقص',missing('summaryEn'),'أضيفي وصفًا إنجليزيًا يعكس نفس المعلومة الموجودة بالعربية.')
 add('no-media','error','عمل بلا ملف أو نص كامل',visible.filter(w=>!w.hasMedia&&!present(w.sourceDriveUrl)&&![w.text,w.textAr,w.textEn].some(present)&&!(w.category==='photo'&&w.hasCover)),'اربطِي ملفًا منشورًا، أو اكتبي نص السكريبت كاملًا.')
 add('drive-assets','warning','الملف الأصلي ما زال على Google Drive',visible.filter(w=>present(w.sourceDriveId)&&!w.hasMedia&&!w.hasCover),'يظهر العمل في البورتفوليو، لكن الملف نفسه لم يُرفع إلى تخزين Sanity بعد. استخدمي «نقل 260 عمل إلى Sanity» ثم الرفع الجماعي.')
 add('bad-category','error','قسم رئيسي غير معروف',visible.filter(w=>!categoryIds.has(w.category)),'اختاري قسمًا من المجالات الستة.')
 add('bad-group','warning','قسم فرعي لا يتوافق مع الرئيسي',visible.filter(w=>w.group&&validateGroup(w.group,w)!==true),'راجعي اختيار القسم الفرعي أو امسحيه.')
 add('file-titles','warning','عنوان يشبه اسم ملف تلقائي',visible.filter(w=>/^(?:copy of )?(?:IMG|VID|DSC|MVI)[\s_-]*[0-9٠-٩]|^v[0-9a-z]{23,}$|^untitled|^بدون عنوان/i.test(title(w))),'استبدلي أسماء الملفات بعناوين مفهومة للعمل.')
 add('role-ar','info','دور فاطمة بالعربية غير مذكور',missing('roleAr'),'أضيفي دورها الحقيقي فقط إن كان معروفًا.')
 add('role-en','info','دور فاطمة بالإنجليزية غير مذكور',missing('roleEn'),'أضيفي ترجمة الدور عند توفره.')
 add('cover','info','أعمال من دون غلاف اختياري',visible.filter(w=>!w.hasCover),'دي معلومة فقط، مش مشكلة: ملفات PDF تُعرض معاينة صفحتها الأولى تلقائيًا.')
 const orderZero=visible.filter(w=>typeof w.order!=='number'||w.order===0)
 if(orderZero.length>1)add('order','info','أعمال بترتيب افتراضي متكرر',orderZero,'لتحديد ترتيب العرض من Sanity، اكتبي أرقامًا مختلفة في ترتيب العرض.')
 const cert=raw.certificates||[]
 add('certificate','warning','شهادات ناقصة العنوان أو الملف',cert.filter(c=>!present(c.titleAr)||!present(c.titleEn)||!c.file),'راجعي بيانات الشهادات باللغتين والملف المرفق.')
 const settings=raw.settings||[]
 if(settings.length>1)add('settings-duplicate','warning','أكثر من سجل لإعدادات الموقع',settings,'الموقع يختار أحدث سجل؛ وجود نسخ متعددة قد يؤدي لعرض بيانات غير متوقعة.')
 if(!settings.length)add('settings-missing','warning','إعدادات الموقع غير منشورة',[{_id:'siteSettings',title:'إعدادات الموقع'}],'أضيفي سجلًا لإعدادات الموقع والصورتين ووسيلة التواصل.')
 for(const w of visible){counts[w.category]=(counts[w.category]||0)+1}
 const priority={error:0,warning:1,info:2};issues.sort((a,b)=>priority[a.severity]-priority[b.severity]||b.count-a.count)
 return {works,visible,counts,issues,settings,certificateCount:cert.length,legacy:raw.legacy||0,drafts:raw.drafts||0,featured:visible.filter(w=>w.featured).length,socialCount:raw.social?.socials?.length||0}
}
function IssueCard({issue}){
 const color={error:'#d24d59',warning:'#ad6b13',info:'#78469d'}[issue.severity]
 return h('section',{style:{...panel,borderInlineStart:'5px solid '+color}},
  h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}},
   h('h3',{style:{fontSize:17,margin:0}},issue.label),
   h('strong',{style:{padding:'4px 12px',borderRadius:999,background:color,color:'#fff',fontSize:12}},issue.count+' عمل')
  ),
  h('p',{style:{fontSize:13,opacity:.85,margin:'10px 0'}},issue.help),
  h('div',{style:{fontSize:12,lineHeight:2.1,opacity:.8}},...issue.items.map(item=>h('div',{key:item._id},'• '+title(item))))
 )
}
export function StudioAudit(){
 const client=useClient({apiVersion:'2025-02-19'}),[data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true)
 const refresh=useCallback(async()=>{
  setLoading(true);setError('')
  try{const response=await client.fetch(groq,{},{perspective:'published'});setData(buildReport(response))}
  catch(e){setError('تعذّر قراءة بيانات Sanity. راجعي اتصال الإنترنت وصلاحية تسجيل الدخول. '+(e?.message||''))}
  finally{setLoading(false)}
 },[client])
 useEffect(()=>{refresh()},[refresh])
 return h('main',{lang:'ar',dir:'rtl',style:design},
  h('p',{style:{fontSize:12,fontWeight:800,color:'#9671b3',letterSpacing:'.03em'}},'FATMA’S JOURNEY / CONTENT QUALITY'),
  h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:18,flexWrap:'wrap',marginBottom:20}},
   h('div',null,h('h1',{style:{fontSize:'clamp(24px,3vw,36px)',lineHeight:1.65,margin:0}},'مراجعة جودة الأعمال والتعريب'),
    h('p',{style:{fontSize:14,opacity:.8,margin:'5px 0',maxWidth:740}},'بيانات حقيقية من Sanity وقت فتح الصفحة. الفحص يراجع الأعمال والشهادات والإعدادات. أغلفة PDF اختيارية ولا تُعتبر خطأ.')),
   h('button',{type:'button',style:action,onClick:refresh,disabled:loading},loading?'جارٍ الفحص…':'إعادة الفحص ↻')
  ),
  error&&h('p',{role:'alert',style:{color:'#e9919c',fontWeight:700}},error),
  !data&&loading&&h('p',{role:'status'},'جارٍ مراجعة المحتوى المنشور…'),
  data&&h(React.Fragment,null,
   h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:12,margin:'22px 0 27px'}},
    ...[
     [data.visible.length,'أعمال منشورة'],
     [data.drafts,'مسودات Sanity'],
     [data.featured,'أعمال مميزة'],
     [data.certificateCount,'شهادات'],
     [data.legacy,'سجلات قديمة'],
     [data.settings.length,'إعدادات الموقع']
    ].map(([number,label])=>h('div',{key:label,style:panel},
      h('div',{style:{fontSize:28,fontWeight:900,lineHeight:1.3}},number),
      h('div',{style:{fontSize:12,opacity:.78}},label)
    ))
   ),
   h('section',{style:{...panel,marginBottom:20}},
    h('h2',{style:{fontSize:19,margin:'0 0 9px'}},'توزيع الأعمال حسب المجال'),
    h('div',{style:{display:'flex',flexWrap:'wrap',gap:9}},
     ...Object.entries(data.counts).map(([key,value])=>h('span',{key,style:{borderRadius:999,border:'1px solid #937bae66',padding:'5px 13px',fontSize:12}},categoryTitle(key)+' — '+value))
    )
   ),
   h('section',{style:{...panel,marginBottom:20}},
    h('h2',{style:{fontSize:19,margin:'0 0 6px'}},'فحص الصفحة الرئيسية والإعدادات'),
    h('p',{style:{fontSize:13,margin:'0 0 7px'}},'الروابط الاجتماعية الإضافية: '+data.socialCount+' · الأعمال المختارة يدويًا: '+data.featured),
    h('p',{style:{fontSize:13,margin:0,opacity:.78}},'الصور والإيميل يتم جلبهم من أحدث إعدادات موقع منشورة. إعدادات متعددة لنفس النوع قد تؤدي إلى تعارض.')
   ),
   h('h2',{style:{fontSize:23,margin:'30px 0 15px'}},'نتائج الفحص — '+data.issues.length+' أنواع من الملاحظات'),
   data.issues.length===0?h('p',{style:panel},'كل قواعد التدقيق الأساسية نجحت. يُفضّل مراجعة جودة الصور والنصوص يدويًا أيضًا.')
    :h('div',{style:{display:'grid',gap:13}},...data.issues.map(issue=>h(IssueCard,{key:issue.id,issue}))),
   h('p',{style:{fontSize:13,opacity:.8,margin:'24px 0'}},'للتعديل: افتحي «كل الأعمال — بحث وتعديل»، ثم اعملي بحث بعنوان العمل. بعد التصحيح اضغطي «نشر التعديلات» وارجعي هنا لإعادة الفحص.'),
   h('p',{style:{fontSize:12,opacity:.7}},'تنبيه: الأعمال القديمة الظاهرة من كتالوج Google Drive ليست كلها سجلات منشورة في Sanity؛ الفحص ده يُراجع سجلات Sanity نفسها فقط.')
  )
 )
}
