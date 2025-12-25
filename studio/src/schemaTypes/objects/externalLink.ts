import {defineField, defineType} from 'sanity'
import {LinkIcon, EnvelopeIcon} from '@sanity/icons'

/**
 * External Link object - for links that can be external URLs or email addresses.
 * Used in About page contact section and other places.
 */
export const externalLink = defineType({
  name: 'externalLink',
  title: 'External Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'The text that will be displayed for this link',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      initialValue: 'external',
      options: {
        list: [
          {title: 'External URL', value: 'external'},
          {title: 'Email', value: 'email'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'External URL (https://...)',
      hidden: ({parent}) => parent?.linkType !== 'external',
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'external' && !value) {
            return 'URL is required for external links'
          }
          return true
        }),
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      description: 'Email address (will automatically create mailto: link)',
      hidden: ({parent}) => parent?.linkType !== 'email',
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'email') {
            if (!value) {
              return 'Email is required for email links'
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return 'Please enter a valid email address'
            }
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      label: 'label',
      linkType: 'linkType',
      url: 'url',
      email: 'email',
    },
    prepare({label, linkType, url, email}) {
      return {
        title: label || 'Untitled Link',
        subtitle: linkType === 'email' ? email : url,
        media: linkType === 'email' ? EnvelopeIcon : LinkIcon,
      }
    },
  },
})
