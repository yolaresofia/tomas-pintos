import { defineQuery } from "next-sanity";

// ============ SETTINGS ============
export const settingsQuery = defineQuery(`
  *[_type == "settings" && _id == "siteSettings"][0]{
    title,
    description,
    footerLeftText,
    footerRightText,
    footerCenterText,
    ogImage
  }
`);

// ============ HOMEPAGE ============
export const homepageQuery = defineQuery(`
  *[_type == "homepage" && _id == "homepage"][0]{
    _id,
    title,
    fotoImage,
    movementDirectionImage,
    performanceImage,
    "previewVideoUrl": previewVideo.asset->url,
    seoTitle,
    seoDescription
  }
`);

// ============ ABOUT ============
export const aboutQuery = defineQuery(`
  *[_type == "about" && _id == "about"][0]{
    _id,
    mainText,
    selectedClients,
    selectedClientsDescription,
    specialties,
    contact[]{
      _key,
      label,
      linkType,
      url,
      email
    },
    backgroundColor,
    seoTitle,
    seoDescription
  }
`);

// ============ PROJECTS ============

// Get all projects for navigation (grouped by category)
export const allProjectsForNavQuery = defineQuery(`
  {
    "foto": *[_type == "project" && category == "foto"] | order(title asc) {
      _id,
      title,
      "slug": slug.current
    },
    "movementDirection": *[_type == "project" && category == "movement-direction"] | order(title asc) {
      _id,
      title,
      "slug": slug.current
    },
    "performance": *[_type == "project" && category == "performance"] | order(title asc) {
      _id,
      title,
      "slug": slug.current
    }
  }
`);

// Get a single project by slug and category
export const projectBySlugQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    category,
    description,
    relevantLinks[]{
      _key,
      label,
      linkType,
      url,
      email
    },
    featuredImage,
    leftColumn{
      photos[]{
        _key,
        "isVideo": coalesce(isVideo, false),
        image,
        "previewVideoUrl": previewVideoUrl.asset->url,
        fullVideoUrl,
        alt,
        displayMode
      }
    },
    rightColumn{
      photos[]{
        _key,
        "isVideo": coalesce(isVideo, false),
        image,
        "previewVideoUrl": previewVideoUrl.asset->url,
        fullVideoUrl,
        alt,
        displayMode
      }
    },
    seoTitle,
    seoDescription
  }
`);

// Get all project slugs for static generation
export const allProjectSlugsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current)]{
    "slug": slug.current,
    category
  }
`);

// Get projects by category
export const projectsByCategoryQuery = defineQuery(`
  *[_type == "project" && category == $category] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    featuredImage,
    description
  }
`);

// ============ SITEMAP ============
export const sitemapQuery = defineQuery(`
  *[_type == "project" && defined(slug.current)] | order(_updatedAt desc) {
    "slug": slug.current,
    category,
    _updatedAt
  }
`);
