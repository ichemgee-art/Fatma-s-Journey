export const categories = [
 {value:'content',title:'صناعة المحتوى',subtitle:'خطط المحتوى والسكريبتات'},
 {value:'photo',title:'التصوير الفوتوغرافي',subtitle:'الصور وأعمال التصوير'},
 {value:'voice',title:'التعليق الصوتي',subtitle:'التسجيلات الصوتية والفيديوهات والإعلانات'},
 {value:'video',title:'الفيديوهات والريلز',subtitle:'أعمال الفيديو والمونتاج'},
 {value:'dubbing',title:'الدبلجة',subtitle:'الشخصيات والأداء الصوتي'},
 {value:'ai',title:'محتوى الذكاء الاصطناعي',subtitle:'الصور والفيديوهات والموسيقى'},
];
export const sections = [
 {id:'content-plans',category:'content',group:'Content plans',title:'خطط المحتوى',type:'pdf'},
 {id:'content-scripts',category:'content',group:'scripts',title:'السكريبتات والنصوص',type:'document'},
 {id:'photography',category:'photo',group:'',title:'التصوير الفوتوغرافي',type:'image'},
 {id:'voice-audio',category:'voice',group:'',title:'فويس أوفر — ملف صوتي',type:'audio',filter:'type == "audio" && group != "Advertising"'},
 {id:'voice-video',category:'voice',group:'',title:'فويس أوفر — فيديو',type:'video',filter:'type == "video" && group != "Advertising"'},
 {id:'voice-advertising',category:'voice',group:'Advertising',title:'الإعلانات الصوتية',type:'video'},
 {id:'reels',category:'video',group:'Reels',title:'الفيديوهات والريلز',type:'video'},
 {id:'dubbing',category:'dubbing',group:'',title:'الدبلجة',type:'video'},
 {id:'ai-images',category:'ai',group:'Ai Designs',title:'صور الذكاء الاصطناعي',type:'image'},
 {id:'ai-videos',category:'ai',group:'Ai Videos',title:'فيديوهات الذكاء الاصطناعي',type:'video'},
 {id:'ai-engineering',category:'ai',group:'Ai Videos / Engineering',title:'فيديوهات الذكاء الاصطناعي — الهندسة',type:'video'},
 {id:'ai-music',category:'ai',group:'Ai Songs',title:'موسيقى وأغاني الذكاء الاصطناعي',type:'video'},
];
export const templates = sections.map(s=>({
 id:'work-'+s.id,title:'إضافة '+s.title,schemaType:'work',
 value:{category:s.category,group:s.group,type:s.type,hidden:false,order:0},
}));
export function categoryTitle(value){return categories.find(c=>c.value===value)?.title||'عمل إبداعي';}
export function groupTitle(value){return sections.find(s=>s.group&&s.group===value)?.title||value||'';}
