import {defineField, defineType} from 'sanity'

export const caseStudy = defineType({
  name: 'caseStudy',
  type: 'document',
  fields: [
    defineField({
      type: 'string',
      name: 'title',
    }),
    defineField({
      type: 'string',
      name: 'responsibility',
    }),
    defineField({
      type: 'text',
      name: 'description',
    }),
    defineField({
      type: 'string',
      name: 'descriptionFooter',
    }),
    defineField({
      name: 'caseColor',
      description:
        'A color in RGB format i.e. `rbg(255, 0, 0)`. If you would like to convert a HEX number to RGB format, go here https://www.rapidtables.com/convert/color/hex-to-rgb.html',
      type: 'string',
    }),
    defineField({
      name: 'textColor',
      description:
        'A color in RGB format i.e. `rbg(255, 0, 0)`. If you would like to convert a HEX number to RGB format, go here https://www.rapidtables.com/convert/color/hex-to-rgb.html',
      type: 'string',
    }),
    defineField({
      type: 'array',
      name: 'caseImages',
      of: [{type: 'image'}],
    }),
  ],
})
