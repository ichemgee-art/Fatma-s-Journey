import {categories, sections} from './sections.js'
import {StudioGuide} from './components/StudioGuide.js'

export const structure = (S) => {
 const templateItems = specs => specs.map(s=>S.initialValueTemplateItem('work-'+s.id).title('إضافة '+s.title))
 function list(category,section){
  const specs=section?[section]:sections.filter(s=>s.category===category.value)
  let filter='_type == "work" && category == $category'
  const params={category:category.value}
  if(section?.filter)filter+=' && ('+section.filter+')'
  else if(section?.group){filter+=' && lower(coalesce(group,"")) == lower($group)';params.group=section.group}
  return S.documentList().id(section?.id||category.value+'-all').title(section?.title||'كل أعمال '+category.title)
   .schemaType('work').apiVersion('2025-02-19').filter(filter).params(params)
   .defaultOrdering([{field:'order',direction:'asc'},{field:'_createdAt',direction:'desc'}])
   .initialValueTemplates(templateItems(specs))
 }
 return S.list().id('portfolio').title('إدارة أعمال فاطمة').items([
  S.listItem().id('start').title('ابدئي هنا — طريقة الاستخدام').child(S.component().id('guide').title('دليل بسيط').component(StudioGuide)),
  S.divider(),
  S.documentTypeListItem('certificate').title('الشهادات / Certificates'),
  S.documentTypeListItem('siteSettings').title('صور الموقع وروابط التواصل'),
  S.divider(),
  ...categories.map(category=>{
   const specs=sections.filter(s=>s.category===category.value)
   return S.listItem().id(category.value).title(category.title).child(
    specs.length===1?list(category,specs[0]):S.list().id(category.value+'-sections').title(category.title).items([
     S.listItem().id(category.value+'-all').title('كل أعمال القسم').child(list(category)),
     S.divider(),
     ...specs.map(s=>S.listItem().id(s.id).title(s.title).child(list(category,s))),
    ])
   )
  }),
  S.divider(),
  S.listItem().id('all-work').title('كل الأعمال — بحث وتعديل').child(
   S.documentTypeList('work').title('كل الأعمال').defaultOrdering([{field:'_createdAt',direction:'desc'}])
    .initialValueTemplates(templateItems(sections))
  ),
 ])
}
