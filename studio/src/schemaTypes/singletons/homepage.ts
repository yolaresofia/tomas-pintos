import {defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons'

/**
 * Homepage singleton - contains settings for the homepage.
 *
 * The three-column navigation (Foto, Movement Direction, Performance)
 * is dynamically generated from published projects, so we don't need
 * to configure it here.
 */
export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'images', title: 'Images', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal title for reference (not displayed on site)',
      initialValue: 'Homepage',
      validation: (Rule) => Rule.required(),
    }),

    // ============ IMAGES GROUP ============
    defineField({
      name: 'fotoImage',
      title: 'Foto Section Image',
      type: 'image',
      group: 'images',
      description: 'Background image for the Foto column (left)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'movementDirectionImage',
      title: 'Movement Direction Section Image',
      type: 'image',
      group: 'images',
      description: 'Background image for the Movement Direction column (center)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'performanceImage',
      title: 'Performance Section Image',
      type: 'image',
      group: 'images',
      description: 'Background image for the Performance column (right)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'previewVideo',
      title: 'Preview Video',
      type: 'file',
      group: 'images',
      description: 'Video file for the homepage preview',
      options: {
        accept: 'video/*',
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
        title: 'Homepage',
        subtitle: 'Homepage configuration',
      }
    },
  },
})
