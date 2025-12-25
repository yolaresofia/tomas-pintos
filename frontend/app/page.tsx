import type { Metadata } from "next";

import { sanityFetch } from "@/sanity/lib/live";
import { homepageQuery, allProjectsForNavQuery, settingsQuery } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/utils";
import HomePageClient from "@/app/components/HomePageClient";

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
  const fotoImageUrl = homepage?.fotoImage
    ? urlForImage(homepage.fotoImage)?.width(800).quality(85).url()
    : null;

  const movementDirectionImageUrl = homepage?.movementDirectionImage
    ? urlForImage(homepage.movementDirectionImage)?.width(800).quality(85).url()
    : null;

  const performanceImageUrl = homepage?.performanceImage
    ? urlForImage(homepage.performanceImage)?.width(800).quality(85).url()
    : null;

  return (
    <HomePageClient
      fotoImageUrl={fotoImageUrl}
      movementDirectionImageUrl={movementDirectionImageUrl}
      performanceImageUrl={performanceImageUrl}
      projects={projects}
      settings={settings}
    />
  );
}
