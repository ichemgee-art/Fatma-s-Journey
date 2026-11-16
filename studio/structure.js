import {categories, sections} from './sections.js'
import {StudioGuide} from './components/StudioGuide.js'
import {StudioAudit} from './components/StudioAudit.js'
import {LegacyMigration} from './components/LegacyMigration.js'

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
 return S.list().id('portfolio').title('لوحة إدارة فاطمة — سهلة وواضحة').items([
  S.listItem().id('start').title('① ابدئي هنا — دليل الاستخدام')
   .child(S.component().id('guide').title('خطوات سهلة لرفع ونشر الأعمال').component(StudioGuide)),
  S.listItem().id('all-work').title('② كل أعمالك — بحث وتعديل')
   .child(S.documentTypeList('work').title('كل الأعمال')
    .defaultOrdering([{field:'_createdAt',direction:'desc'}])
    .initialValueTemplates(templateItems(sections))),
  S.divider(),
  ...categories.map(category=>{
   const specs=sections.filter(s=>s.category===category.value)
   return S.listItem().id(category.value).title('📁 '+category.title).child(
    specs.length===1?list(category,specs[0]):S.list().id(category.value+'-sections').title(category.title).items([
     S.listItem().id(category.value+'-all').title('كل أعمال القسم').child(list(category)),
     S.divider(),
     ...specs.map(s=>S.listItem().id(s.id).title(s.title).child(list(category,s))),
    ])
   )
  }),
  S.divider(),
  S.listItem().id('certificates').title('③ الشهادات — إضافة وتعديل')
   .child(S.documentTypeList('certificate').title('الشهادات')),
  S.listItem().id('volunteering').title('④ التطوعات — إضافة وتعديل')
   .child(S.documentTypeList('volunteering').title('التطوعات').defaultOrdering([{field:'order',direction:'asc'},{field:'_createdAt',direction:'desc'}])),
  S.documentTypeListItem('siteSettings').title('⑤ صور Home وAbout وإعدادات الموقع'),
  S.listItem().id('social-settings').title('⑥ روابط التواصل الاجتماعي')
   .child(S.document().schemaType('socialSettings').documentId('socialSettings')),
  S.divider(),
  S.listItem().id('advanced').title('⚙ أدوات متقدمة — عند الحاجة فقط')
   .child(S.list().id('advanced-tools').title('أدوات الفحص والنقل').items([
    S.listItem().id('quality-audit').title('فحص المحتوى والأخطاء')
     .child(S.component().id('contentAudit').title('مراجعة جودة المحتوى').component(StudioAudit)),
    S.listItem().id('drive-migration').title('نقل ملفات Google Drive إلى Sanity')
     .child(S.component().id('driveImport').title('نقل الملفات القديمة').component(LegacyMigration)),
   ])),
 ])
}
