import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons'

/**
 * Site Settings singleton - global settings for the website.
 * Contains footer configuration and other site-wide settings.
 *
 * Note: Navigation is dynamic (automatically pulls from published projects),
 * so it's not configured here.
 */
export const settings = defineType({
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'general', title: 'General', default: true},
    {name: 'footer', title: 'Footer'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    // ============ GENERAL GROUP ============
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      group: 'general',
      description: 'The name of the website',
      initialValue: 'Tomás Pintos',
    }),
    defineField({
      name: 'description',
      title: 'Site Description',
      type: 'text',
      group: 'general',
      rows: 3,
      description: 'A brief description of the website',
    }),

    // ============ FOOTER GROUP ============
    defineField({
      name: 'footerLeftText',
      title: 'Footer Left Text',
      type: 'string',
      group: 'footer',
      description: 'Text displayed on the left side of the footer (e.g., "TOMAS")',
      initialValue: 'TOMAS',
    }),
    defineField({
      name: 'footerRightText',
      title: 'Footer Right Text',
      type: 'string',
      group: 'footer',
      description: 'Text displayed on the right side of the footer (e.g., "PINTOS")',
      initialValue: 'PINTOS',
    }),
    defineField({
      name: 'footerCenterText',
      title: 'Footer Center Text',
      type: 'string',
      group: 'footer',
      description: 'Text displayed in the center of the footer (e.g., "(ABOUT)")',
      initialValue: '(ABOUT)',
    }),

    // ============ SEO GROUP ============
    defineField({
      name: 'ogImage',
      title: 'Default Open Graph Image',
      type: 'image',
      group: 'seo',
      description: 'Default image used when sharing pages on social media',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'metadataBase',
          title: 'Metadata Base URL',
          type: 'url',
          description: 'The base URL of your site (e.g., https://tomaspintos.com)',
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
        subtitle: 'Global website configuration',
      }
    },
  },
})
