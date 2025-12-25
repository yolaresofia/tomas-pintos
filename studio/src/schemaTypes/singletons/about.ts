import {defineField, defineType, defineArrayMember} from 'sanity'
import {UserIcon} from '@sanity/icons'

/**
 * About page singleton - contains all content for the About page.
 */
export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  icon: UserIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'appearance', title: 'Appearance'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'mainText',
      title: 'Main Text',
      type: 'blockContent',
      group: 'content',
      description: 'The main introductory text for the About page',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'selectedClients',
      title: 'Selected Clients',
      type: 'string',
      group: 'content',
      description: 'Heading for the clients section (e.g., "Selected Clients")',
    }),
    defineField({
      name: 'selectedClientsDescription',
      title: 'Selected Clients Description',
      type: 'text',
      group: 'content',
      rows: 4,
      description: 'Description or list of selected clients',
    }),
    defineField({
      name: 'specialties',
      title: 'Specialties',
      type: 'array',
      group: 'content',
      description: 'List of specialties or skills',
      of: [
        defineArrayMember({
          type: 'string',
        }),
      ],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'contact',
      title: 'Contact Links',
      type: 'array',
      group: 'content',
      description: 'Contact links (external URLs or email addresses)',
      of: [defineArrayMember({type: 'externalLink'})],
    }),

    // ============ APPEARANCE GROUP ============
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'color',
      group: 'appearance',
      description: 'Background color for the About page',
      options: {
        disableAlpha: true,
      },
    }),

    // ============ SEO GROUP ============
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      description: 'Override the page title for search engines',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      group: 'seo',
      rows: 3,
      description: 'Description for search engine results',
      validation: (Rule) => Rule.max(160).warning('Keep SEO descriptions under 160 characters'),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'About',
        subtitle: 'About page content',
      }
    },
  },
})
