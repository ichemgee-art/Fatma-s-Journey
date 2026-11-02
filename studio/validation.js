import {sections} from './sections.js'

export function validateMedia(value,document={}){
 if(value?.asset?._ref||typeof document.text==='string'&&document.text.trim())return true
 if(document.cover?.asset?._ref&&(!document.type||document.type==='image'))return true
 return 'ارفع ملف العمل في هذه الخانة، أو اكتب السكريبت في خانة النص الكامل. انتظر اكتمال الرفع قبل النشر.'
}
export function validateGroup(value,document={}){
 if(!value)return true
 return sections.some(s=>s.category===document.category&&s.group?.trim().toLowerCase()===value.trim().toLowerCase())||'هذا القسم الفرعي لا يناسب القسم الرئيسي. يمكنك تغييره أو مسح الاختيار.'
}
export function validateTitle(value){return typeof value==='string'&&value.trim().length>=2||'اكتبي اسمًا واضحًا للعمل، حرفين على الأقل، بدل تركه فارغًا.'}
export function coverAdvice(dimensions){if(!dimensions)return true;const {width,height}=dimensions;if(width<800||height<600)return 'الصورة صغيرة وقد تظهر غير واضحة. يُفضّل غلاف 1600 × 1200 بكسل.';if(Math.abs(width/height-4/3)>.2)return 'نسبة الصورة مختلفة عن 4:3؛ سيُقص جزء منها على الكارت. خلي العنصر المهم في المنتصف أو اختاري غلاف 1600 × 1200.';return true}
