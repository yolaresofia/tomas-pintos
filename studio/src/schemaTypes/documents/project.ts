import {defineField, defineType, defineArrayMember} from 'sanity'
import {DocumentIcon, ImageIcon, PlayIcon, StarIcon} from '@sanity/icons'

/**
 * Project document type - the main content type for all projects across
 * Foto (Selected Works & Editorial), Movement Direction, and Performance categories.
 */
export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Media'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    // ============ CONTENT GROUP ============
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      description: 'The URL-friendly version of the title',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'content',
      description: 'The main category this project belongs to',
      options: {
        list: [
          {title: 'Foto - Selected Works', value: 'foto-selected-works'},
          {title: 'Foto - Editorial', value: 'foto-editorial'},
          {title: 'Movement Direction', value: 'movement-direction'},
          {title: 'Performance', value: 'performance'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'content',
      rows: 4,
      description: 'A brief description of the project (displayed in the middle section)',
    }),
    defineField({
      name: 'relevantLinks',
      title: 'Relevant Links',
      type: 'array',
      group: 'content',
      description: 'External links related to this project',
      of: [defineArrayMember({type: 'externalLink'})],
    }),

    // ============ MEDIA GROUP ============
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      group: 'media',
      description: 'Main image used for thumbnails and previews',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'leftColumn',
      title: 'Left Photo Column',
      type: 'photoColumn',
      group: 'media',
      description: 'Photos displayed on the left side of the project page',
    }),
    defineField({
      name: 'rightColumn',
      title: 'Right Photo Column',
      type: 'photoColumn',
      group: 'media',
      description: 'Photos displayed on the right side of the project page',
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
  orderings: [
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
    {
      title: 'Title Z-A',
      name: 'titleDesc',
      by: [{field: 'title', direction: 'desc'}],
    },
    {
      title: 'Category',
      name: 'categoryAsc',
      by: [{field: 'category', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      media: 'featuredImage',
    },
    prepare({title, category, media}) {
      const categoryLabels: Record<string, string> = {
        'foto-selected-works': 'Foto - Selected Works',
        'foto-editorial': 'Foto - Editorial',
        'movement-direction': 'Movement Direction',
        'performance': 'Performance',
      }

      const categoryIcons: Record<string, typeof ImageIcon> = {
        'foto-selected-works': ImageIcon,
        'foto-editorial': ImageIcon,
        'movement-direction': PlayIcon,
        'performance': StarIcon,
      }

      return {
        title: title || 'Untitled Project',
        subtitle: categoryLabels[category] || category,
        media: media || categoryIcons[category] || DocumentIcon,
      }
    },
  },
})
