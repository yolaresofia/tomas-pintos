import {defineField, defineType, defineArrayMember} from 'sanity'
import {ImageIcon} from '@sanity/icons'

/**
 * Photo Column object - represents a column of photos with display mode options.
 * Used in project pages for left and right photo columns.
 */
export const photoColumn = defineType({
  name: 'photoColumn',
  title: 'Photo Column',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'photoItem',
          title: 'Photo',
          icon: ImageIcon,
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Alternative text for accessibility',
            }),
            defineField({
              name: 'displayMode',
              title: 'Display Mode',
              type: 'string',
              initialValue: 'stacked',
              options: {
                list: [
                  {title: 'Stacked (one on top of another)', value: 'stacked'},
                  {title: 'Fullscreen (takes full height)', value: 'fullscreen'},
                ],
                layout: 'radio',
              },
            }),
          ],
          preview: {
            select: {
              media: 'image',
              displayMode: 'displayMode',
              alt: 'alt',
            },
            prepare({media, displayMode, alt}) {
              return {
                title: alt || 'Photo',
                subtitle: displayMode === 'fullscreen' ? 'Fullscreen' : 'Stacked',
                media,
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      photos: 'photos',
    },
    prepare({photos}) {
      const count = photos?.length || 0
      return {
        title: `Photo Column`,
        subtitle: `${count} photo${count !== 1 ? 's' : ''}`,
      }
    },
  },
})
