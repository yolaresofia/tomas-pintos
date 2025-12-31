import Image from "next/image";
import Link from "next/link";

import { urlForImage, resolveExternalLink } from "@/sanity/lib/utils";
import { PortableText } from "@/app/components/PortableText";
import ProjectNav from "@/app/components/ProjectNav";
import type { ProjectBySlugQueryResult, SettingsQueryResult } from "@/sanity.types";

type PhotoColumn = NonNullable<ProjectBySlugQueryResult>["leftColumn"];

type NavProject = {
  _id: string;
  title: string | null;
  slug: string | null;
};

type ProjectPageProps = {
  project: NonNullable<ProjectBySlugQueryResult>;
  settings: SettingsQueryResult;
  categoryProjects?: NavProject[];
};

function PhotoColumnRenderer({ column, side }: { column: PhotoColumn; side: "left" | "right" }) {
  if (!column?.photos || column.photos.length === 0) return null;

  return (
    <div className={`flex flex-col ${side === "right" ? "items-end" : "items-start"}`}>
      {column.photos.map((photo) => {
        const imageUrl = urlForImage(photo.image)?.width(800).quality(85).url();
        if (!imageUrl) return null;

        const isFullscreen = photo.displayMode === "fullscreen";

        return (
          <div
            key={photo._key}
            className={`relative ${isFullscreen ? "w-full h-screen" : "w-full"}`}
          >
            <Image
              src={imageUrl}
              alt={photo.alt || ""}
              width={800}
              height={isFullscreen ? 1200 : 600}
              className={`object-cover ${isFullscreen ? "w-full h-full" : "w-full h-auto"}`}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function ProjectPage({ project, settings, categoryProjects }: ProjectPageProps) {
  const category = project.category as "foto" | "movement-direction" | "performance" | null;

  return (
    <div className="h-screen relative overflow-hidden">
      <div className="h-full grid grid-cols-[1.1fr_0.8fr_1.1fr]">
        <div className="relative overflow-y-auto">
          {category && categoryProjects && categoryProjects.length > 0 && (
            <div className="fixed top-0 left-0 p-6 z-10">
              <ProjectNav
                category={category}
                projects={categoryProjects}
                currentSlug={project.slug ?? undefined}
              />
            </div>
          )}
          <PhotoColumnRenderer column={project.leftColumn} side="left" />
        </div>
        <div className="overflow-y-auto flex flex-col items-start text-left px-4 pt-6">
          {project.title && (
            <h1 className="text-lg font-medium mb-4">{project.title}</h1>
          )}
          {project.description && (
            <PortableText value={project.description} className="text-xs mb-6" />
          )}
          {project.relevantLinks && project.relevantLinks.length > 0 && (
            <div className="space-y-2">
              {project.relevantLinks.map((link) => {
                const href = resolveExternalLink(link);
                if (!href) return null;
                return (
                  <a
                    key={link._key}
                    href={href}
                    target={link.linkType === "external" ? "_blank" : undefined}
                    rel={link.linkType === "external" ? "noopener noreferrer" : undefined}
                    className="block text-xs hover:opacity-60 transition-opacity uppercase"
                  >
                    <span className="mr-1">→</span>
                    {link.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>
        <div className="overflow-y-auto">
          <PhotoColumnRenderer column={project.rightColumn} side="right" />
        </div>
      </div>
      <footer className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end pointer-events-none">
        <Link href="/" className="text-sm font-medium tracking-wider hover:opacity-60 transition-opacity pointer-events-auto">
          {settings?.footerLeftText || "TOMAS"}
        </Link>
        <Link href="/about" className="text-sm hover:opacity-60 transition-opacity pointer-events-auto">
          {settings?.footerCenterText || "(ABOUT)"}
        </Link>
        <Link href="/" className="text-sm font-medium tracking-wider hover:opacity-60 transition-opacity pointer-events-auto">
          {settings?.footerRightText || "PINTOS"}
        </Link>
      </footer>
    </div>
  );
}
