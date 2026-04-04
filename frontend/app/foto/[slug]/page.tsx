import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProjectPage from "@/app/components/ProjectPage";
import { sanityFetch } from "@/sanity/lib/live";
import { projectBySlugQuery, allProjectSlugsQuery, settingsQuery, projectsByCategoryQuery } from "@/sanity/lib/queries";
import { resolveOpenGraphImage } from "@/sanity/lib/utils";

// Revalidate every hour (ISR)
export const revalidate = 3600;

// Allow dynamic params for new slugs not in generateStaticParams
export const dynamicParams = true;

type Props = {
  params: Promise<{ slug: string }>;
};

// The user at second 3601 sees the stale page (the cached one from build time). But Next.js triggers a background re-fetch. The next user gets the fresh page.
// So the sequence is: serve stale → revalidate in background → next request gets fresh.
// That's ISR. The user is never waiting for a fetch — they always get a cached page. It just might be up to an hour old.

// Here's the sequence:

// You run npm run build
// - Next.js finds your [slug] folder and sees generateStaticParams
// - It calls that function — which fetches all slugs from Sanity
// - It gets back [{ slug: "project-one" }, { slug: "project-two" }]
// - Next.js then builds a static HTML page for each one: /foto/project-one, /foto/project-two

// It's Next.js calling your function during the build process to know what pages to generate. 
// Not a browser request, not a user request — just the build pipeline saying "hey, what URLs should I pre-render?"

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: allProjectSlugsQuery,
    perspective: "published",
    stega: false,
  });

  return (data || [])
    .filter((p: { slug: string | null; category: string | null }) => p.category === "foto")
    .map((p: { slug: string | null }) => ({ slug: p.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { data: project } = await sanityFetch({
    query: projectBySlugQuery,
    params: { slug: params.slug },
    stega: false,
  });

  const ogImage = resolveOpenGraphImage(project?.featuredImage);

  return {
    title: project?.seoTitle || project?.title,
    description: project?.seoDescription,
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function FotoPage(props: Props) {
  const params = await props.params;

  const [{ data: project }, { data: settings }, { data: fotoProjects }] = await Promise.all([
    sanityFetch({ query: projectBySlugQuery, params: { slug: params.slug } }),
    sanityFetch({ query: settingsQuery }),
    sanityFetch({ query: projectsByCategoryQuery, params: { category: "foto" } }),
  ]);

  if (!project?._id || project.category !== "foto") {
    return notFound();
  }

  return (
    <ProjectPage
      project={project}
      settings={settings}
      categoryProjects={fotoProjects}
    />
  );
}
