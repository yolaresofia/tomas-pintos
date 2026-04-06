# Tomas Pintos — Portfolio Website

Portfolio website for Tomás Pintos, a multidisciplinary artist based between Barcelona and Paris working across photography, movement direction, and performance.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **CMS:** Sanity.io with GROQ queries and TypeGen
- **Styling:** Tailwind CSS
- **Scroll:** Lenis (smooth scroll only, no GSAP dependency)
- **Deployment:** Vercel

## Architecture

The site is organized around three dynamic route categories — `/foto`, `/movement-direction`, and `/performance` — each with its own `[slug]` page sharing a common `ProjectPage` component.

### Key technical decisions

**ISR (Incremental Static Regeneration)**
All routes use `revalidate = 3600`. Pages are statically generated at build time and revalidated in the background every hour, ensuring fast load times without stale content.

**generateStaticParams**
All dynamic `[slug]` routes use `generateStaticParams` to pre-render pages at build time. `dynamicParams = true` ensures new Sanity content is available on demand without requiring a full redeploy.

**Image optimization**
Images are served via Sanity's CDN with responsive `sizes` attributes, WebP format negotiation, and lazy loading via Next.js `<Image>`. This is critical given the project's heavy reliance on high-resolution photography.

**Smooth scroll**
Lenis is used for smooth scrolling on the three-column desktop layout. It is applied independently to each column via a custom `useLenisScroller` hook, without any GSAP dependency.

**Component architecture**
The `ProjectPage` component handles both mobile and desktop layouts. Sub-components (`ColumnImage`, `ImageLightbox`, `MediaColumnRenderer`) are responsible for rendering media columns, lightbox navigation, and video playback.

## Sanity Setup

- Schema: `project` document type with `leftColumn` and `rightColumn` media arrays
- TypeGen: auto-generated TypeScript types via `sanity-typegen`
- Queries defined in `sanity/lib/queries.ts`

## Running locally

\```bash
npm install
npm run dev
\```

Requires a `.env.local` file with Sanity project credentials. See `.env.example`.