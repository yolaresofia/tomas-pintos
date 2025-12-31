import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProjectPage from "@/app/components/ProjectPage";
import { sanityFetch } from "@/sanity/lib/live";
import { projectBySlugQuery, allProjectSlugsQuery, settingsQuery, projectsByCategoryQuery } from "@/sanity/lib/queries";
import { resolveOpenGraphImage } from "@/sanity/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

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
