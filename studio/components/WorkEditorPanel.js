import React from 'react'
import {useFormValue} from 'sanity'
import {reviewWork} from '../workReview.js'
const h=React.createElement
const section={background:'rgba(133,93,168,.08)',border:'1px solid rgba(137,112,161,.38)',borderRadius:19,padding:'18px 20px',fontFamily:'Alexandria,Tahoma,sans-serif',direction:'rtl',lineHeight:1.9}
export function WorkEditorPanel(){
 const doc=useFormValue([])||{}
 const {errors,warnings,ready}=reviewWork(doc)
 const [expanded,setExpanded]=React.useState(true)
 const guide=[
  ['١','القسم والعناوين','اختاري القسم، واكتبي الاسم والوصف بالعربي والإنجليزي.'],
  ['٢','الملف الأصلي','هنا الفيديو أو PDF أو الصورة أو الصوت اللي الزائر هيفتحه.'],
  ['٣','صورة الكارت الخارجية','صورة مستقلة للكارت في الموقع. مش غلاف الفيديو الداخلي ومش بتغير ملفه.'],
  ['٤','النشر','راجعي الملاحظات تحت، وبعدها اضغطي «نشر على الموقع» من أعلى الاستوديو.']
 ]
 return h('div',{dir:'rtl',lang:'ar',style:section},
  h('div',{style:{display:'flex',justifyContent:'space-between',gap:13,alignItems:'start',flexWrap:'wrap'}},
   h('div',null,h('div',{style:{fontSize:11,fontWeight:800,color:'#9b70cd'}},'دليل العمل الحالي'),h('strong',{style:{fontSize:19,display:'block'}},'اعملي إيه قبل النشر؟')),
   h('button',{type:'button',onClick:()=>setExpanded(x=>!x),style:{cursor:'pointer',borderRadius:11,padding:'8px 12px',border:'1px solid #aa8aba',background:'transparent',color:'inherit',font:'700 12px Alexandria,Tahoma,sans-serif'}},expanded?'إخفاء الشرح −':'إظهار الشرح +')
  ),
  expanded&&h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(185px,1fr))',gap:10,marginTop:15}},
   ...guide.map(([n,title,body])=>h('div',{key:title,style:{padding:'13px',background:'rgba(160,119,193,.09)',border:'1px solid rgba(134,104,165,.2)',borderRadius:12}},
    h('span',{style:{fontWeight:900,display:'inline-block',marginInlineEnd:8,color:'#a378ce'}},n),
    h('strong',{style:{fontSize:13}},title),
    h('p',{style:{fontSize:12,margin:'6px 0 0',opacity:.86}},body)))),
  h('div',{role:'status','aria-live':'polite',style:{marginTop:15,padding:'13px 15px',borderRadius:13,background:ready?'rgba(31,131,100,.09)':'rgba(201,65,71,.09)',border:'1px solid '+(ready?'rgba(52,150,105,.4)':'rgba(185,64,71,.4)')}},
   h('strong',{style:{fontSize:13}},ready?'✓ لا توجد أخطاء أساسية في الحقول':'⚠ قبل النشر: '+errors.length+' مشكلة تحتاج تصحيح'),
   ...errors.map(e=>h('p',{key:e.code,style:{fontSize:12,margin:'6px 0 0',color:'#da6470'}},'• '+e.message)),
   warnings.length>0&&h('details',{style:{marginTop:10}},
    h('summary',{style:{cursor:'pointer',fontSize:12}},'ملاحظات لتحسين المحتوى ('+warnings.length+')'),
    ...warnings.map(w=>h('p',{key:w.code,style:{fontSize:12,margin:'5px 0'}},'• '+w.message))
   )
  ),
  h('p',{style:{fontSize:11,opacity:.7,margin:'12px 0 0'}},'دي مراجعة إرشادية. Sanity هيعمل فحص نهائي قبل السماح بالنشر. الحذف من قائمة إجراءات المستند، مش من أزرار رفع الملف.')
 )
}
