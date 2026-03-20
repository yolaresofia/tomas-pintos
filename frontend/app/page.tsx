import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/live";
import { homepageQuery, allProjectsForNavQuery, settingsQuery } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/utils";
import HomePageClient from "@/app/components/HomePageClient";

// Revalidate every hour (ISR)
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { data: homepage } = await sanityFetch({
    query: homepageQuery,
    stega: false,
  });

  return {
    title: homepage?.seoTitle || "Home",
    description: homepage?.seoDescription,
  };
}

export default async function HomePage() {
  const [{ data: homepage }, { data: projects }, { data: settings }] = await Promise.all([
    sanityFetch({ query: homepageQuery }),
    sanityFetch({ query: allProjectsForNavQuery }),
    sanityFetch({ query: settingsQuery }),
  ]);

  // Get image URLs for each section
  // Use 1920px width for high-DPI displays, WebP format, and auto quality
  const fotoImageUrl = homepage?.fotoImage
    ? urlForImage(homepage.fotoImage)?.url() ?? null
    : null;

  const movementDirectionImageUrl = homepage?.movementDirectionImage
    ? urlForImage(homepage.movementDirectionImage)?.url() ?? null
    : null;

  const performanceImageUrl = homepage?.performanceImage
    ? urlForImage(homepage.performanceImage)?.url() ?? null
    : null;

  // Get preview video URL (already resolved in GROQ query)
  const previewVideoUrl = homepage?.previewVideoUrl || null;

  const fallbackImageUrl = homepage?.fallbackImage
    ? urlForImage(homepage.fallbackImage)?.url() ?? null
    : null;

  return (
    <HomePageClient
      fotoImageUrl={fotoImageUrl}
      movementDirectionImageUrl={movementDirectionImageUrl}
      performanceImageUrl={performanceImageUrl}
      previewVideoUrl={previewVideoUrl}
      fallbackImageUrl={fallbackImageUrl}
      projects={projects}
      settings={settings}
    />
  );
}
