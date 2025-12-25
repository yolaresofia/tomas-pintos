import { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/live";
import { sitemapQuery } from "@/sanity/lib/queries";
import { headers } from "next/headers";

/**
 * Helper to get URL path based on project category
 */
function getCategoryPath(category: string): string {
  switch (category) {
    case "foto-selected-works":
      return "foto/selected-works";
    case "foto-editorial":
      return "foto/editorial";
    case "movement-direction":
      return "movement-direction";
    case "performance":
      return "performance";
    default:
      return "";
  }
}

/**
 * Generates a sitemap for the application.
 * Learn more: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const domain = headersList.get("host") as string;

  const sitemap: MetadataRoute.Sitemap = [];

  // Homepage
  sitemap.push({
    url: `https://${domain}`,
    lastModified: new Date(),
    priority: 1,
    changeFrequency: "monthly",
  });

  // About page
  sitemap.push({
    url: `https://${domain}/about`,
    lastModified: new Date(),
    priority: 0.8,
    changeFrequency: "monthly",
  });

  // Fetch all projects
  const { data: projects } = await sanityFetch({
    query: sitemapQuery,
    stega: false,
  });

  if (projects && projects.length > 0) {
    for (const project of projects) {
      const categoryPath = getCategoryPath(project.category || "");
      if (categoryPath && project.slug) {
        sitemap.push({
          url: `https://${domain}/${categoryPath}/${project.slug}`,
          lastModified: project._updatedAt ? new Date(project._updatedAt) : new Date(),
          priority: 0.6,
          changeFrequency: "monthly",
        });
      }
    }
  }

  return sitemap;
}
