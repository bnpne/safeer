import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {schemaTypes} from './schemas'
import {deskStructure} from './structures/deskStructure'

export const config = defineConfig({
  plugins: [deskTool()],
  name: 'studio',
  projectId: import.meta.env.VITE_PROJECT_ID,
  dataset: 'production',
  basePath: '/admin',
  plugins: [
    deskTool({
      // structure: deskStructure,
    }),
  ],
  schema: {
    types: schemaTypes,
  },
})
