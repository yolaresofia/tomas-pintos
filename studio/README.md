# Tomas Pintos — Sanity Studio

Content management studio for the Tomas Pintos portfolio website.

## Structure

**Singletons** (one document, always exist)
- `Homepage` — hero content and intro text
- `About` — artist bio and about page content  
- `Site Settings` — global settings, footer text

**Document types**
- `Project` — shared schema for all three categories (Foto, Movement Direction, Performance)

Each project has:
- `title`, `slug`, `category` (enum: foto / movement-direction / performance)
- `leftColumn` and `rightColumn` — arrays of media items (images or videos)
- `description` — Portable Text
- `relevantLinks` — external or internal links
- SEO fields — title, description, Open Graph image

## Content model notes

All three project categories (Foto, Movement Direction, Performance) share a single `project` document type. Category filtering happens at the query level via GROQ, not at the schema level. This keeps the schema simple and avoids duplication.

## Deploy hook

The studio includes a custom deploy button via the Vercel Deploy plugin, giving the client the ability to trigger a production build and publish content changes independently without developer intervention.

## TypeGen

Types are auto-generated from this schema using `sanity-typegen`. Run:

\```bash
npx sanity typegen generate
\```

## Running locally

\```bash
npm install
npm run dev
\```