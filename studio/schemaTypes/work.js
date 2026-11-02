import {defineField, defineType} from 'sanity'
import {categories, sections, categoryTitle, groupTitle} from '../sections.js'
import {validateMedia,validateGroup,validateTitle,coverAdvice,validateLocalized} from '../validation.js'
import {LocalizedInput} from '../components/LocalizedInput.js'
import {WorkFileInput,WorkCoverInput} from '../components/WorkFileInput.js'

const fileTypes = [
 {title:'صورة',value:'image'},{title:'فيديو',value:'video'},{title:'ملف صوتي',value:'audio'},
 {title:'ملف PDF',value:'pdf'},{title:'نص أو مستند Word',value:'document'},
]
const groups = [...new Map(sections.filter(s=>s.group).map(s=>[s.group,{title:categoryTitle(s.category)+' — '+s.title,value:s.group}])).values()]

export const work = defineType({
 name:'work',title:'عمل إبداعي',type:'document',
 description:'اختاري القسم، ثم اكتبي العنوان والوصف باللغتين. أضيفي الملف والغلاف، وانتظري اكتمال الرفع، ثم انشري التعديلات.',
 initialValue:{hidden:false,order:0},
 fieldsets:[{name:'basics',title:'1. القسم ونوع العمل'},{name:'arabic',title:'2. المحتوى بالعربية'},{name:'english',title:'3. المحتوى بالإنجليزية'},{name:'legacy',title:'بيانات قديمة — تُستخدم عند غياب الترجمة',options:{collapsible:true,collapsed:true}},{name:'mediaUpload',title:'4. ملف العمل'},{name:'coverUpload',title:'5. غلاف الكارت — اختياري لكل أنواع الأعمال'},
  {name:'details',title:'تفاصيل إضافية — اختياري',options:{collapsible:true,collapsed:true}},
  {name:'visibility',title:'الترتيب وإظهار العمل',options:{collapsible:true,collapsed:true}},
 ],
 fields:[
  defineField({name:'category',fieldset:'basics',type:'string',title:'القسم الرئيسي',description:'يُختار تلقائيًا عندما تضيف العمل من أحد الأقسام. يمكنك تغييره لنقل العمل.',options:{list:categories,layout:'dropdown'},validation:r=>r.required().error('اختَر القسم الذي سيظهر فيه العمل.')}), 
  defineField({name:'group',fieldset:'basics',type:'string',title:'القسم الفرعي — اختياري',description:'يُختار تلقائيًا من القائمة الجانبية. لو غيّرت القسم الرئيسي، غيّر هذا الاختيار أو امسحه.',options:{list:groups},hidden:({document,value})=>['photo','dubbing'].includes(document?.category)&&!value,validation:r=>r.custom((value,context)=>validateGroup(value,context.document)).warning()}),
  defineField({name:'type',fieldset:'basics',type:'string',title:'نوع الملف — اختياري',description:'يختاره القالب تلقائيًا. الموقع يتعرف أيضًا على نوع الملف المرفوع. للسكريبت المكتوب بدون ملف اختَر «نص أو مستند Word».',options:{list:fileTypes,layout:'radio'}}),
  defineField({name:'titleAr',components:{input:LocalizedInput},type:'string',fieldset:'arabic',title:'عنوان العمل بالعربية',description:'يظهر على الكارت وصفحة التفاصيل عند اختيار هذه اللغة.',validation:r=>r.custom((value,context)=>validateLocalized(value,context.document,'titleAr'))}),
  defineField({name:'summaryAr',components:{input:LocalizedInput},type:'text',fieldset:'arabic',title:'الوصف المختصر بالعربية',description:'اكتبي سطرًا أو سطرين عن الفكرة ودور فاطمة بهذه اللغة.',rows:3,validation:r=>r.custom((value,context)=>validateLocalized(value,context.document,'summaryAr'))}),
  defineField({name:'textAr',components:{input:LocalizedInput},type:'text',fieldset:'arabic',title:'النص الكامل أو السكريبت — اختياري بالعربية',description:'اكتبي نسخة السكريبت بهذه اللغة، لو مطلوبة. لا يلزم ترجمة كلام التسجيل نفسه؛ أضيفي فقط النص الذي تريدين عرضه للزائر.',rows:9}),
  defineField({name:'clientAr',components:{input:LocalizedInput},type:'string',fieldset:'arabic',title:'اسم العميل — اختياري بالعربية',description:'اسم العلامة التجارية بهذه اللغة، ويمكن كتابة الاسم نفسه باللغتين لو له اسم ثابت.'}),
  defineField({name:'roleAr',components:{input:LocalizedInput},type:'string',fieldset:'arabic',title:'دور فاطمة — اختياري بالعربية',description:'مثال: كتابة السكريبت، أو التعليق الصوتي، أو المونتاج.'}),
  defineField({name:'titleEn',components:{input:LocalizedInput},type:'string',fieldset:'english',title:'عنوان العمل بالإنجليزية',description:'يظهر على الكارت وصفحة التفاصيل عند اختيار هذه اللغة.',validation:r=>r.custom((value,context)=>validateLocalized(value,context.document,'titleEn'))}),
  defineField({name:'summaryEn',components:{input:LocalizedInput},type:'text',fieldset:'english',title:'الوصف المختصر بالإنجليزية',description:'اكتبي سطرًا أو سطرين عن الفكرة ودور فاطمة بهذه اللغة.',rows:3,validation:r=>r.custom((value,context)=>validateLocalized(value,context.document,'summaryEn'))}),
  defineField({name:'textEn',components:{input:LocalizedInput},type:'text',fieldset:'english',title:'النص الكامل أو السكريبت — اختياري بالإنجليزية',description:'اكتبي نسخة السكريبت بهذه اللغة، لو مطلوبة. لا يلزم ترجمة كلام التسجيل نفسه؛ أضيفي فقط النص الذي تريدين عرضه للزائر.',rows:9}),
  defineField({name:'clientEn',components:{input:LocalizedInput},type:'string',fieldset:'english',title:'اسم العميل — اختياري بالإنجليزية',description:'اسم العلامة التجارية بهذه اللغة، ويمكن كتابة الاسم نفسه باللغتين لو له اسم ثابت.'}),
  defineField({name:'roleEn',components:{input:LocalizedInput},type:'string',fieldset:'english',title:'دور فاطمة — اختياري بالإنجليزية',description:'مثال: كتابة السكريبت، أو التعليق الصوتي، أو المونتاج.'}),
  defineField({name:'media',fieldset:'mediaUpload',type:'file',title:'ارفع ملف العمل هنا',components:{input:WorkFileInput},description:'اضغط «اختيار ملف ورفعه» وانتظر ظهور «الملف مرفوع». للسكريبت المكتوب يمكنك الاكتفاء بخانة النص الكامل.',validation:r=>r.custom((value,context)=>validateMedia(value,context.document))}),
  defineField({name:'cover',fieldset:'coverUpload',type:'image',title:'غلاف الكارت',components:{input:WorkCoverInput},description:'متاح للصور والفيديو والصوت والـPDF والسكريبتات. لا يغيّر ملف العمل الأصلي.',validation:r=>r.custom(async(value,context)=>{if(!value?.asset?._ref)return true;try{const asset=await context.getClient({apiVersion:'2025-02-19'}).getDocument(value.asset._ref);return coverAdvice(asset?.metadata?.dimensions)}catch{return true}}).warning()}),
  defineField({name:'year',type:'string',title:'سنة تنفيذ العمل',fieldset:'details'}),
  defineField({name:'order',type:'number',title:'ترتيب العرض',description:'الأرقام الأصغر تظهر أولًا بين الأعمال الجديدة.',fieldset:'visibility',initialValue:0}),
  defineField({name:'hidden',type:'boolean',title:'إخفاء العمل من الموقع',description:'فعّل هذا الاختيار لإخفائه مع الاحتفاظ به في الاستوديو.',fieldset:'visibility',initialValue:false}),
  defineField({name:'title',hidden:({value})=>!value,fieldset:'legacy',type:'string',title:'اسم العمل — نسخة قديمة',description:'هذا هو العنوان الذي سيظهر على كارت العمل وفي صفحة التفاصيل. مثال: إعلان مطعم — تعليق صوتي.'}), 
  defineField({name:'summary',hidden:({value})=>!value,fieldset:'legacy',type:'text',title:'وصف مختصر للعمل — نسخة قديمة',rows:3,description:'اكتب سطرًا أو سطرين عن الفكرة ودور فاطمة. يظهر الوصف تحت العنوان وفي تفاصيل العمل. مثال: تسجيل تعليق صوتي لإعلان مطعم، بأداء مصري حيوي.'}),
  defineField({name:'text',hidden:({value})=>!value,fieldset:'legacy',type:'text',title:'النص الكامل أو السكريبت — اختياري — نسخة قديمة',rows:12,description:'اكتب أو الصق السكريبت هنا ليظهر داخل نافذة تفاصيل العمل. هذه الخانة مختلفة عن الوصف المختصر. يمكن نشر سكريبت مكتوب هنا بدون ملف.'}),
  defineField({name:'client',hidden:({value})=>!value,type:'string',title:'اسم العميل أو العلامة التجارية — نسخة قديمة',fieldset:'legacy'}),
  defineField({name:'role',hidden:({value})=>!value,type:'string',title:'دور فاطمة في العمل — نسخة قديمة',description:'مثال: كتابة السكريبت، المونتاج، التعليق الصوتي.',fieldset:'legacy'}),
 ],
 orderings:[{title:'ترتيب العرض',name:'portfolioOrder',by:[{field:'order',direction:'asc'}]}],
 preview:{
  select:{title:'title',titleAr:'titleAr',titleEn:'titleEn',category:'category',group:'group',type:'type',media:'cover'},
  prepare({title,titleAr,titleEn,category,group,type,media}){return{title:titleAr||titleEn||title||'عمل جديد بدون عنوان',subtitle:[categoryTitle(category),groupTitle(group),fileTypes.find(t=>t.value===type)?.title].filter(Boolean).join(' / '),media}},
 },
})
