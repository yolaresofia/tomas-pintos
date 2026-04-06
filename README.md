# Tomas Pintos — Portfolio Website

Portfolio website for Tomas Pintos, a multidisciplinary artist based between Barcelona and Paris working across photography, movement direction, and performance.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **CMS:** Sanity.io with GROQ queries and TypeGen
- **Styling:** Tailwind CSS
- **Scroll:** Lenis (smooth scroll)
- **Deployment:** Vercel

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                  # Root layout (fonts, global providers)
│   ├── page.tsx                    # Homepage
│   ├── sitemap.ts                  # Dynamic sitemap generation
│   ├── about/
│   │   └── page.tsx                # About page
│   ├── foto/
│   │   └── [slug]/page.tsx         # Photography project pages
│   ├── movement-direction/
│   │   └── [slug]/page.tsx         # Movement direction project pages
│   ├── performance/
│   │   └── [slug]/page.tsx         # Performance project pages
│   ├── components/
│   │   ├── ProjectPage.tsx         # Shared project layout (mobile + desktop)
│   │   ├── ProjectNav.tsx          # Project navigation
│   │   ├── HomePageClient.tsx      # Homepage client component
│   │   ├── IntroAnimation.tsx      # Landing animation
│   │   ├── PageTransition.tsx      # Route transition animations
│   │   ├── TransitionLink.tsx      # Animated link component
│   │   ├── SmoothScroll.tsx        # Lenis smooth scroll wrapper
│   │   ├── VideoPlayer.tsx         # Video playback component
│   │   ├── PortableText.tsx        # Sanity rich text renderer
│   │   ├── Footer.tsx
│   │   └── HomeButton.tsx
│   └── api/
│       └── draft-mode/enable/      # Sanity preview draft mode
├── sanity/
│   └── lib/
│       ├── queries.ts              # GROQ queries
│       ├── client.ts               # Sanity client config
│       ├── live.ts                 # Live content API
│       ├── utils.ts                # Image/URL helpers
│       ├── api.ts                  # Project config
│       └── token.ts                # Auth token
├── public/
│   └── images/                     # Static assets
├── sanity.types.ts                 # Auto-generated TypeScript types
└── sanity-typegen.json             # TypeGen config
```

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
Lenis is used for smooth scrolling on the three-column desktop layout. It is applied independently to each column via a custom hook, without any GSAP dependency.

**Component architecture**
The `ProjectPage` component handles both mobile and desktop layouts. Sub-components handle rendering media columns, lightbox navigation, and video playback.

## Sanity Integration

- **Schema:** `project` document type with `leftColumn` and `rightColumn` media arrays
- **TypeGen:** Auto-generated TypeScript types via `sanity-typegen`
- **Queries:** Defined in `sanity/lib/queries.ts`
- **Live preview:** Draft mode enabled via `/api/draft-mode/enable`

## Running Locally

```bash
npm install
npm run dev
```

Requires a `.env.local` file with Sanity project credentials. See `.env.example`.
