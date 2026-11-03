import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {portfolioProject, legacyProject, siteSettings, portfolioMedia, certificate} from './schemaTypes/index.js'

import {work} from './schemaTypes/work.js'
import {structure} from './structure.js'
import {templates} from './sections.js'
import {withUploadGuard} from './actions.js'
import {FJIcon} from './components/StudioGuide.js'

export default defineConfig({
  name: 'fatma-portfolio',
  title: 'فاطمة — إدارة البورتفوليو',
  icon:FJIcon,
  projectId: 'q3zqgei4',
  dataset: 'production',
  plugins: [structureTool({title:'إدارة الأعمال',structure})],
  schema: {types: [work, portfolioProject, legacyProject, portfolioMedia, siteSettings, certificate],templates},
  document: {newDocumentOptions:prev=>prev.filter(item=>['certificate','siteSettings'].includes(item.templateId)||templates.some(template=>template.id===item.templateId)),actions:(prev,context)=>context.schemaType==='work'?prev.map(action=>action.action==='publish'?withUploadGuard(action):action):prev},
})
