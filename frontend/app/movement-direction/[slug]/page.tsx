import ProjectPage from "@/app/components/ProjectPage";
import { sanityFetch } from "@/sanity/lib/live";
import {
  allProjectSlugsQuery,
  projectBySlugQuery,
  projectsByCategoryQuery,
  settingsQuery,
} from "@/sanity/lib/queries";
import { resolveOpenGraphImage } from "@/sanity/lib/utils";
import { notFound } from "next/navigation";

export const revalidate = 3600;
export const dynamicParams = true;
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
    .filter((p: { slug: string | null; category: string | null}) => p.category === "movement-direction")
    .map((p: {slug: string | null}) => ({ slug: p.slug }));
}

export async function generateMetadata(props: Props){
  const params = await props.params
  const {data: project} = await sanityFetch({
    query: projectBySlugQuery,
    params: {slug: params.slug},
    stega: false,
  })

  const ogImage = resolveOpenGraphImage(project?.featuredImage)
  return {
    title: project?.seoTitle || project?.title,
    description: project?.seoDescription,
    openGraph: {
      images: ogImage ? [ogImage] : []
    }
  }
  
}

export default async function MovementDirectionPage(props: Props) {
  const params = await props.params;
  const [{ data: project }, { data: settings }, { data: categoryProjects }] =
    await Promise.all([
      sanityFetch({ query: projectBySlugQuery, params: { slug: params.slug } }),
      sanityFetch({ query: settingsQuery }),
      sanityFetch({
        query: projectsByCategoryQuery,
        params: { category: "movement-direction" },
      }),
    ]);
  if (!project?._id || project.category !== "movement-direction") {
    return notFound();
  }
  return (
    <ProjectPage
      project={project}
      settings={settings}
      categoryProjects={categoryProjects}
    />
  );
}
