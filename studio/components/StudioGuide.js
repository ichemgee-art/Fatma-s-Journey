import React from 'react'
const h=React.createElement
export function FJIcon(){return h('svg',{viewBox:'0 0 96 96',fill:'none','aria-hidden':true},h('rect',{width:96,height:96,rx:25,fill:'#211a35'}),h('path',{d:'M20 23h32v11H32v12h17v11H32v19H20Z',fill:'#fff5ed'}),h('path',{d:'M61 23h13v36c0 14-7 21-21 21h-9V68h9c6 0 8-3 8-10Z',fill:'#d4a7f8'}))}
export function StudioGuide(){
 const steps=[
  ['① افتحي القسم المناسب','اختاري من القائمة «كل أعمالك» للتعديل، أو اختاري مجال العمل لإضافة مشروع جديد.'],
  ['② اكتبي الاسم والوصف','في كل عمل فيه عنوان ووصف بالعربي والإنجليزي. السكريبت الكامل اختياري ومستقل.'],
  ['③ ارفعي الملف الأصلي','هنا الفيديو اللي هيتشغّل أو PDF اللي هيتفتح أو ملف الصوت/الصورة. بعد الرفع هتظهر رسالة نجاح.'],
  ['④ ارفعي صورة غلاف الكارت (اختياري)','دي صورة خارج الفيديو بتظهر في Home وWork فقط؛ مش بتغير الفيديو أو ملفه. لو مش محتاجاها اتركيها فاضية.'],
  ['⑤ راجعي وانشري','بصي على صندوق المراجعة في أول العمل. صحّحي الأخطاء الحمراء؛ بعدها اضغطي «نشر على الموقع» من شريط الأدوات.'],
  ['⑥ التعديل أو الإخفاء أو الحذف','للتعديل افتحي العمل وانشري. لإخفائه استخدمي «إخفاء العمل» ثم انشري. الحذف النهائي من قائمة الإجراءات بعد تأكيد Sanity فقط.']
 ]

 return h('main',{dir:'rtl',style:{padding:'clamp(20px,4vw,48px)',maxWidth:1000,margin:'auto',fontFamily:'inherit',lineHeight:1.9}},
  h('div',{style:{display:'flex',gap:16,alignItems:'center',marginBottom:24}},h('div',{style:{width:62,height:62,flexShrink:0}},h(FJIcon)),h('div',null,h('p',{style:{margin:0,fontSize:12,opacity:.7}},'FATMA’S JOURNEY'),h('h1',{style:{fontSize:29,margin:0}},'أهلًا فاطمة، نضيف حكاية جديدة؟'))),
  h('p',{style:{opacity:.8,maxWidth:700}},'كل حقل عليه شرح. التغيير بيتحفظ كمسودة الأول، ومش بيظهر على الموقع إلا لما تضغطي «نشر على الموقع». رفع الملف مش معناه نشره.'),
  h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:16,margin:'26px 0'}},...steps.map(([title,body],i)=>h('section',{key:title,style:{padding:23,border:'1px solid #9682ad55',borderRadius:17,background:'#9370b20c'}},h('span',{style:{display:'inline-grid',placeItems:'center',width:29,height:29,background:'#c69be9',color:'#241b34',borderRadius:9,fontWeight:800}},i+1),h('h2',{style:{fontSize:18,margin:'12px 0 8px'}},title),h('p',{style:{fontSize:14,margin:0,opacity:.8}},body)))),
  h('section',{style:{padding:24,borderRadius:17,border:'1px solid #9682ad55'}},h('h2',{style:{fontSize:18,marginTop:0}},'مهم: الفرق بين إخفاء وحذف، وبين الملف والغلاف'),h('p',{style:{fontSize:14,marginBottom:0}},'إخفاء العمل: يختفي من الزوار لكن يفضل محفوظ هنا. حذف العمل نهائيًا: يمسح السجل بعد تأكيد Sanity. صورة غلاف الكارت الخارجية بتتغير بشكل منفصل عن الفيديو. لو في أخطاء، صندوق المراجعة في أول العمل بيشرحها.')),
  h('p',{style:{fontSize:13,marginTop:18,opacity:.85}},'لو محتاجة نقل ملفات قديمة أو فحص جميع الأعمال، هتلاقي الأدوات دي تحت «⚙ أدوات متقدمة»؛ مش مطلوب تفتحيها مع كل رفع جديد.'),
  h('a',{href:'https://fatma-journey.vercel.app/',target:'_blank',rel:'noopener noreferrer',style:{display:'inline-flex',padding:'12px 20px',marginTop:24,background:'#d3a8f3',color:'#2a1a39',textDecoration:'none',borderRadius:12,fontWeight:800}},'افتحي الموقع لمراجعة النتيجة ↗'))
}
