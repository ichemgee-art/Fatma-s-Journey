import {defineField,defineType} from 'sanity'

export const volunteering = defineType({
 name:'volunteering',
 title:'تطوع / Volunteering',
 type:'document',
 description:'كل تطوع هيتعرض في كارت مستقل على صفحة التطوعات بعد النشر. اكتبي المسمى والوصف بالعربي والإنجليزي، وحطي صورة ورابط الصفحة.',
 initialValue:{order:0,hidden:false},
 groups:[
  {name:'content',title:'① المسمّى والوصف'},
  {name:'image',title:'② صورة الكارت'},
  {name:'link',title:'③ رابط التطوع'},
  {name:'options',title:'④ الترتيب والإظهار'}
 ],
 fields:[
  defineField({name:'roleAr',type:'string',title:'المسمّى أو دوري في التطوع — بالعربي',group:'content',
   description:'مثال: مسؤولة السوشيال ميديا. النص هيظهر تحت الصورة في النسخة العربية.',
   validation:r=>r.required().min(2).error('اكتبي المسمّى بالعربي (حرفين على الأقل).')}),
  defineField({name:'roleEn',type:'string',title:'Role / Position — English',group:'content',
   description:'The role visitors will see below the image in the English version.',
   validation:r=>r.required().min(2).error('اكتبي المسمّى بالإنجليزي (حرفين على الأقل).')}),
  defineField({name:'descriptionAr',type:'text',rows:3,title:'وصف قصير للتطوع — بالعربي',group:'content',
   description:'سطر أو سطرين يوضحوا طبيعة التطوع أو مساهمتك فيه.',
   validation:r=>r.required().min(3).max(400).error('اكتبي وصفًا عربيًا قصيرًا، بحد أقصى 400 حرف.')}),
  defineField({name:'descriptionEn',type:'text',rows:3,title:'Short description — English',group:'content',
   description:'A sentence or two about what you did.',
   validation:r=>r.required().min(3).max(400).error('اكتبي وصفًا إنجليزيًا قصيرًا، بحد أقصى 400 حرف.')}),
  defineField({name:'image',type:'image',title:'صورة غلاف كارت التطوع',group:'image',
   description:'الصورة اللي هتظهر أعلى الكارت. مقاس مقترح 1200 × 900 أو 1600 × 1200. تقدري تختاري نقطة التركيز من Sanity.',
   options:{hotspot:true},validation:r=>r.required().assetRequired().error('ارفعي صورة للتطوع قبل النشر.')}),
  defineField({name:'pageUrl',type:'url',title:'رابط صفحة التطوع',group:'link',
   description:'انسخي الرابط الكامل مثل https://www.facebook.com/... . الموقع هيختار أيقونة المنصة تلقائيًا من الرابط.',
   validation:r=>r.required().uri({scheme:['https']}).error('ضيفي رابط HTTPS صحيح لصفحة التطوع.')}),
  defineField({name:'order',type:'number',title:'ترتيب الكارت — اختياري',group:'options',
   description:'الأصغر بيظهر أولًا. لو سيبتي القيمة 0 هيتم الترتيب بالأحدث.',
   validation:r=>r.min(0)}),
  defineField({name:'hidden',type:'boolean',title:'إخفاء الكارت من الموقع دون حذفه',group:'options',
   description:'بعد النشر الكارت هيختفي من صفحة التطوعات، ويفضل موجود في Sanity.'})
 ],
 orderings:[{title:'الترتيب في الموقع',name:'volunteerOrder',by:[{field:'order',direction:'asc'},{field:'_createdAt',direction:'desc'}]}],
 preview:{select:{title:'roleAr',subtitle:'roleEn',media:'image',hidden:'hidden'},
  prepare({title,subtitle,media,hidden}){return{title:title||subtitle||'تطوع جديد',subtitle:(hidden?'مخفي — ':'')+(subtitle||'Volunteering'),media}}}
})
