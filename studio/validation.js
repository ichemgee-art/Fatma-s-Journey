import {sections} from './sections.js'

export function validateMedia(value,document={}){
 if(value?.asset?._ref||[document.text,document.textEn,document.textAr].some(v=>typeof v==='string'&&v.trim()))return true
 if(document.cover?.asset?._ref&&(!document.type||document.type==='image'))return true
 return 'ارفع ملف العمل في هذه الخانة، أو اكتب السكريبت في خانة النص الكامل. انتظر اكتمال الرفع قبل النشر.'
}
export function validateGroup(value,document={}){
 if(!value)return true
 return sections.some(s=>s.category===document.category&&s.group?.trim().toLowerCase()===value.trim().toLowerCase())||'هذا القسم الفرعي لا يناسب القسم الرئيسي. يمكنك تغييره أو مسح الاختيار.'
}
export function validateTitle(value){return typeof value==='string'&&value.trim().length>=2||'اكتبي اسمًا واضحًا للعمل، حرفين على الأقل، بدل تركه فارغًا.'}
const localizedFields=['titleAr','titleEn','summaryAr','summaryEn','textAr','textEn','clientAr','clientEn','roleAr','roleEn']
export function validateLocalized(value,document={},field=''){
 const valid=typeof value==='string'&&value.trim().length>=2
 if(valid)return true
 const legacy=typeof document.title==='string'&&document.title.trim()&&!localizedFields.some(k=>typeof document[k]==='string'&&document[k].trim())
 if(legacy)return true
 const labels={titleAr:'عنوان العمل بالعربية',titleEn:'عنوان العمل بالإنجليزية',summaryAr:'الوصف المختصر بالعربية',summaryEn:'الوصف المختصر بالإنجليزية'}
 return 'اكتبي '+labels[field]+'، حرفين على الأقل. الموقع يعرض النص المناسب للغة الزائر.'
}
export function coverAdvice(dimensions){if(!dimensions)return true;const {width,height}=dimensions;if(width<800||height<450)return 'الصورة صغيرة وقد تظهر غير واضحة. يُفضّل غلاف 1600 × 900 بكسل.';if(Math.abs(width/height-16/9)>.2)return 'نسبة الصورة مختلفة عن 16:9؛ سيُقص جزء منها على الكارت. خلي العنصر المهم في المنتصف أو اختاري غلاف 1600 × 900.';return true}
