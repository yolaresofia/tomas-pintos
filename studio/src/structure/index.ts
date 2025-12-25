import {CogIcon, HomeIcon, UserIcon, ImageIcon, PlayIcon, StarIcon, DocumentsIcon} from '@sanity/icons'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'

/**
 * Custom Studio structure for Tomás Pintos portfolio.
 *
 * Organization:
 * - Singletons at the top (Homepage, About, Settings)
 * - Projects organized by category (Foto, Movement Direction, Performance)
 *
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 */

// Singleton types that should not appear in generic document lists
const SINGLETONS = ['settings', 'homepage', 'about', 'assist.instruction.context']

// Hidden types that should not appear anywhere
const HIDDEN_TYPES = ['assist.instruction.context']

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // ============ SINGLETONS ============
      S.listItem()
        .title('Homepage')
        .icon(HomeIcon)
        .child(S.document().schemaType('homepage').documentId('homepage')),

      S.listItem()
        .title('About')
        .icon(UserIcon)
        .child(S.document().schemaType('about').documentId('about')),

      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('settings').documentId('siteSettings')),

      S.divider(),

      // ============ PROJECTS BY CATEGORY ============
      S.listItem()
        .title('Foto')
        .icon(ImageIcon)
        .child(
          S.list()
            .title('Foto')
            .items([
              S.listItem()
                .title('Selected Works')
                .icon(ImageIcon)
                .child(
                  S.documentList()
                    .title('Selected Works')
                    .filter('_type == "project" && category == "foto-selected-works"')
                    .defaultOrdering([{field: 'title', direction: 'asc'}])
                ),
              S.listItem()
                .title('Editorial')
                .icon(ImageIcon)
                .child(
                  S.documentList()
                    .title('Editorial')
                    .filter('_type == "project" && category == "foto-editorial"')
                    .defaultOrdering([{field: 'title', direction: 'asc'}])
                ),
              S.divider(),
              S.listItem()
                .title('All Foto Projects')
                .icon(DocumentsIcon)
                .child(
                  S.documentList()
                    .title('All Foto Projects')
                    .filter(
                      '_type == "project" && (category == "foto-selected-works" || category == "foto-editorial")'
                    )
                    .defaultOrdering([{field: 'title', direction: 'asc'}])
                ),
            ])
        ),

      S.listItem()
        .title('Movement Direction')
        .icon(PlayIcon)
        .child(
          S.documentList()
            .title('Movement Direction')
            .filter('_type == "project" && category == "movement-direction"')
            .defaultOrdering([{field: 'title', direction: 'asc'}])
        ),

      S.listItem()
        .title('Performance')
        .icon(StarIcon)
        .child(
          S.documentList()
            .title('Performance')
            .filter('_type == "project" && category == "performance"')
            .defaultOrdering([{field: 'title', direction: 'asc'}])
        ),

      S.divider(),

      // ============ ALL PROJECTS ============
      S.listItem()
        .title('All Projects')
        .icon(DocumentsIcon)
        .child(
          S.documentList()
            .title('All Projects')
            .filter('_type == "project"')
            .defaultOrdering([{field: 'category', direction: 'asc'}, {field: 'title', direction: 'asc'}])
        ),

      S.divider(),

      // ============ REMAINING DOCUMENT TYPES ============
      // Filter out singletons and hidden types
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId()
        return !SINGLETONS.includes(id as string) && !HIDDEN_TYPES.includes(id as string) && id !== 'project'
      }),
    ])
