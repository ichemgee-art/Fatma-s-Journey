import {sections} from './sections.js'

export function validateMedia(value,document={}){
 if(value?.asset?._ref||typeof document.text==='string'&&document.text.trim())return true
 if(document.cover?.asset?._ref&&(!document.type||document.type==='image'))return true
 return 'ارفع ملف العمل في هذه الخانة، أو اكتب السكريبت في خانة النص الكامل. انتظر اكتمال الرفع قبل النشر.'
}
export function validateGroup(value,document={}){
 if(!value)return true
 return sections.some(s=>s.category===document.category&&s.group===value)||'هذا القسم الفرعي لا يناسب القسم الرئيسي. يمكنك تغييره أو مسح الاختيار.'
}
