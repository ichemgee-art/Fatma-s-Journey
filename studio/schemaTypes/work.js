import {defineField, defineType} from 'sanity'
import {categories, sections, categoryTitle, groupTitle} from '../sections.js'

const fileTypes = [
 {title:'صورة',value:'image'},{title:'فيديو',value:'video'},{title:'ملف صوتي',value:'audio'},
 {title:'ملف PDF',value:'pdf'},{title:'نص أو مستند Word',value:'document'},
]
const groups = [...new Map(sections.filter(s=>s.group).map(s=>[s.group,{title:categoryTitle(s.category)+' — '+s.title,value:s.group}])).values()]

export const work = defineType({
 name:'work',title:'عمل إبداعي',type:'document',
 description:'اختَر القسم من القائمة الجانبية، ثم اكتب اسم العمل ووصفه وارفع الملف. اضغط Publish عند الانتهاء.',
 initialValue:{hidden:false,order:0},
 fieldsets:[
  {name:'details',title:'تفاصيل إضافية — اختياري',options:{collapsible:true,collapsed:true}},
  {name:'visibility',title:'الترتيب وإظهار العمل',options:{collapsible:true,collapsed:true}},
 ],
 fields:[
  defineField({name:'title',type:'string',title:'اسم العمل',description:'هذا هو العنوان الذي سيظهر على كارت العمل وفي نافذة العرض. مثال: إعلان مطعم — تعليق صوتي.',validation:r=>r.required().error('اكتب اسم العمل أولًا.')}), 
  defineField({name:'summary',type:'text',title:'وصف مختصر للعمل',rows:3,description:'اكتب سطرًا أو سطرين عن الفكرة ودور فاطمة. يظهر الوصف تحت العنوان وفي تفاصيل العمل. مثال: تسجيل تعليق صوتي لإعلان مطعم، بأداء مصري حيوي.'}),
  defineField({name:'category',type:'string',title:'القسم الرئيسي',description:'يُختار تلقائيًا عندما تضيف العمل من أحد الأقسام. يمكنك تغييره لنقل العمل.',options:{list:categories,layout:'dropdown'},validation:r=>r.required().error('اختَر القسم الذي سيظهر فيه العمل.')}), 
  defineField({name:'group',type:'string',title:'القسم الفرعي',description:'يُختار تلقائيًا من القائمة الجانبية. يمكن تركه فارغًا للتصوير والدبلجة والتعليق الصوتي العام.',options:{list:groups},hidden:({document})=>['photo','dubbing'].includes(document?.category),validation:r=>r.custom((value,context)=>{
   if(!value)return true
   const valid=sections.some(s=>s.category===context.document?.category&&s.group===value)
   return valid||'القسم الفرعي لا ينتمي للقسم الرئيسي. اختَر قسمًا مناسبًا أو امسح الاختيار.'
  })}),
  defineField({name:'type',type:'string',title:'نوع الملف',description:'غالبًا يكون محددًا تلقائيًا. اختَر «ملف صوتي» للـMP3، و«فيديو» للـMP4، أو النوع المناسب لملفك.',options:{list:fileTypes,layout:'radio'},validation:r=>r.required().error('اختَر نوع الملف.')}), 
  defineField({name:'media',type:'file',title:'ارفع ملف العمل هنا',description:'اضغط Upload لاختيار صورة أو فيديو أو ملف صوتي أو PDF أو Word من جهازك. انتظر حتى يكتمل الرفع. إذا كان العمل نصًا فقط، يمكنك كتابته في خانة النص الكامل بدل رفع ملف.'}),
  defineField({name:'cover',type:'image',title:'صورة الغلاف — اختياري',description:'الصورة التي تظهر على كارت الفيديو أو الصوت أو المستند. للصور العادية سيستخدم الموقع الصورة المرفوعة تلقائيًا.',options:{hotspot:true}}),
  defineField({name:'text',type:'text',title:'النص الكامل أو السكريبت — اختياري',rows:12,description:'اكتب أو الصق السكريبت هنا ليظهر داخل نافذة تفاصيل العمل. هذه الخانة مختلفة عن الوصف المختصر. يمكن نشر سكريبت مكتوب هنا بدون ملف.'}),
  defineField({name:'client',type:'string',title:'اسم العميل أو العلامة التجارية',fieldset:'details'}),
  defineField({name:'role',type:'string',title:'دور فاطمة في العمل',description:'مثال: كتابة السكريبت، المونتاج، التعليق الصوتي.',fieldset:'details'}),
  defineField({name:'year',type:'string',title:'سنة تنفيذ العمل',fieldset:'details'}),
  defineField({name:'order',type:'number',title:'ترتيب العرض',description:'الأرقام الأصغر تظهر أولًا بين الأعمال الجديدة.',fieldset:'visibility',initialValue:0}),
  defineField({name:'hidden',type:'boolean',title:'إخفاء العمل من الموقع',description:'فعّل هذا الاختيار لإخفائه مع الاحتفاظ به في الاستوديو.',fieldset:'visibility',initialValue:false}),
 ],
 validation:r=>r.custom(doc=>!doc||doc.media?.asset?._ref||doc.text?.trim()?true:'ارفع ملف العمل أو اكتب النص الكامل قبل النشر.'),
 orderings:[{title:'ترتيب العرض',name:'portfolioOrder',by:[{field:'order',direction:'asc'}]}],
 preview:{
  select:{title:'title',category:'category',group:'group',type:'type',media:'cover'},
  prepare({title,category,group,type,media}){return{title:title||'عمل جديد بدون عنوان',subtitle:[categoryTitle(category),groupTitle(group),fileTypes.find(t=>t.value===type)?.title].filter(Boolean).join(' / '),media}},
 },
})
