import {defineField, defineType, defineArrayMember} from 'sanity'
import {ImageIcon, PlayIcon} from '@sanity/icons'

/**
 * Media Column object - represents a column of media items (photos or videos) with display mode options.
 * Used in project pages for left and right media columns.
 * Note: Field names 'photos' and 'photoItem' are kept for backwards compatibility with existing data.
 */
export const mediaColumn = defineType({
  // Keep as 'photoColumn' for backwards compatibility with existing data
  name: 'photoColumn',
  title: 'Media Column',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      // Keep as 'photos' for backwards compatibility with existing data
      name: 'photos',
      title: 'Media Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          // Keep as 'photoItem' for backwards compatibility with existing data
          name: 'photoItem',
          title: 'Media Item',
          icon: ImageIcon,
          fields: [
            defineField({
              name: 'isVideo',
              title: 'Is Video',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
              hidden: ({parent}) => parent?.isVideo,
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as {isVideo?: boolean}
                  if (!parent?.isVideo && !value) {
                    return 'Image is required when not a video'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'previewVideoUrl',
              title: 'Preview Video',
              type: 'file',
              description: 'Short preview video (max 10 seconds) that plays muted on loop. Upload directly to Sanity.',
              options: {
                accept: 'video/*',
              },
              hidden: ({parent}) => !parent?.isVideo,
            }),
            defineField({
              name: 'fullVideoUrl',
              title: 'Full Video URL (Vimeo)',
              type: 'url',
              description: 'Vimeo URL for the full video (e.g., https://vimeo.com/123456789). Opens in fullscreen when preview is clicked.',
              hidden: ({parent}) => !parent?.isVideo,
            }),
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Alternative text for accessibility',
            }),
          ],
          preview: {
            select: {
              media: 'image',
              alt: 'alt',
              isVideo: 'isVideo',
            },
            prepare({media, alt, isVideo}) {
              return {
                title: alt || (isVideo ? 'Video' : 'Image'),
                media: isVideo ? PlayIcon : media,
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
        title: `Media Column`,
        subtitle: `${count} item${count !== 1 ? 's' : ''}`,
      }
    },
  },
})