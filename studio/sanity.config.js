import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {portfolioProject, legacyProject, siteSettings, portfolioMedia} from './schemaTypes/index.js'

import {work} from './schemaTypes/work.js'
import {structure} from './structure.js'
import {templates} from './sections.js'

export default defineConfig({
  name: 'fatma-portfolio',
  title: 'فاطمة — إدارة البورتفوليو',
  projectId: 'q3zqgei4',
  dataset: 'production',
  plugins: [structureTool({title:'إدارة الأعمال',structure})],
  schema: {types: [work, portfolioProject, legacyProject, portfolioMedia, siteSettings],templates},
  document: {newDocumentOptions:prev=>prev.filter(item=>templates.some(template=>template.id===item.templateId))},
})
