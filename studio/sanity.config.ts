/**
 * This config is used to configure your Sanity Studio.
 * Learn more: https://www.sanity.io/docs/configuration
 */

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './src/schemaTypes'
import {structure} from './src/structure'
import {
  presentationTool,
  defineDocuments,
  defineLocations,
  type DocumentLocation,
} from 'sanity/presentation'
import {colorInput} from '@sanity/color-input'
import {vercelDeployPlugin} from './src/plugins/vercelDeploy'

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// URL for preview functionality, defaults to localhost:3000 if not set
const SANITY_STUDIO_PREVIEW_URL = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

// Define the home location for the presentation tool
const homeLocation = {
  title: 'Home',
  href: '/',
} satisfies DocumentLocation

// Helper to get the URL path based on project category
function getCategoryPath(category: string): string {
  switch (category) {
    case 'foto-selected-works':
      return 'foto/selected-works'
    case 'foto-editorial':
      return 'foto/editorial'
    case 'movement-direction':
      return 'movement-direction'
    case 'performance':
      return 'performance'
    default:
      return ''
  }
}

// Main Sanity configuration
export default defineConfig({
  name: 'default',
  title: 'Tomás Pintos',

  projectId,
  dataset,

  plugins: [
    // Presentation tool configuration for Visual Editing
    presentationTool({
      previewUrl: {
        origin: SANITY_STUDIO_PREVIEW_URL,
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      resolve: {
        // Main Document Resolver API
        mainDocuments: defineDocuments([
          {
            route: '/',
            filter: `_type == "homepage" && _id == "homepage"`,
          },
          {
            route: '/about',
            filter: `_type == "about" && _id == "about"`,
          },
          {
            route: '/foto/selected-works/:slug',
            filter: `_type == "project" && category == "foto-selected-works" && slug.current == $slug`,
          },
          {
            route: '/foto/editorial/:slug',
            filter: `_type == "project" && category == "foto-editorial" && slug.current == $slug`,
          },
          {
            route: '/movement-direction/:slug',
            filter: `_type == "project" && category == "movement-direction" && slug.current == $slug`,
          },
          {
            route: '/performance/:slug',
            filter: `_type == "project" && category == "performance" && slug.current == $slug`,
          },
        ]),
        // Locations Resolver API
        locations: {
          settings: defineLocations({
            locations: [homeLocation],
            message: 'This document is used on all pages',
            tone: 'positive',
          }),
          homepage: defineLocations({
            locations: [homeLocation],
            message: 'Homepage configuration',
            tone: 'positive',
          }),
          about: defineLocations({
            locations: [
              {
                title: 'About',
                href: '/about',
              },
            ],
          }),
          project: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
              category: 'category',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: `/${getCategoryPath(doc?.category || '')}/${doc?.slug}`,
                },
                homeLocation,
              ].filter((loc) => loc.href) as DocumentLocation[],
            }),
          }),
        },
      },
    }),
    structureTool({
      structure,
    }),
    colorInput(),
    vercelDeployPlugin(),
  ],

  schema: {
    types: schemaTypes,
  },
})
