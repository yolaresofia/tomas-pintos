"use client";

import Image from "next/image";

import VideoPlayer from "@/app/components/VideoPlayer";
import { urlForImage, resolveExternalLink } from "@/sanity/lib/utils";
import { PortableText } from "@/app/components/PortableText";
import ProjectNav from "@/app/components/ProjectNav";
import type {
  ProjectBySlugQueryResult,
  SettingsQueryResult,
} from "@/sanity.types";
import Footer from "./Footer";
import HomeButton from "./HomeButton";

type MediaItem = {
  _key: string;
  isVideo: boolean;
  image?: {
    _type: "image";
    asset?: {
      _ref: string;
      _type: "reference";
    };
  } | null;
  previewVideoUrl?: string | null;
  fullVideoUrl?: string | null;
  alt?: string | null;
  displayMode?: "stacked" | "fullscreen" | null;
};

type MediaColumn = {
  photos: MediaItem[] | null;
} | null;

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

function MediaColumnRenderer({
  column,
  side,
  projectTitle,
}: {
  column: MediaColumn;
  side: "left" | "right";
  projectTitle?: string;
}) {
  if (!column?.photos || column.photos.length === 0) return null;

  return (
    <div
      className={`flex flex-col ${side === "right" ? "items-end" : "items-start"}`}
    >
      {column.photos.map((item) => {
        const isFullscreen = item.displayMode === "fullscreen";

        // Handle video items
        if (item.isVideo && item.previewVideoUrl && item.fullVideoUrl) {
          return (
            <VideoPlayer
              key={item._key}
              previewVideoUrl={item.previewVideoUrl}
              fullVideoUrl={item.fullVideoUrl}
              alt={item.alt}
              isFullscreen={isFullscreen}
              title={projectTitle}
            />
          );
        }

        // Handle image items
        const imageUrl = urlForImage(item.image)?.width(800).quality(85).url();
        if (!imageUrl) return null;

        return (
          <div
            key={item._key}
            className={`relative ${isFullscreen ? "w-full h-screen" : "w-full"}`}
          >
            <Image
              src={imageUrl}
              alt={item.alt || ""}
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

export default function ProjectPage({
  project,
  settings,
  categoryProjects,
}: ProjectPageProps) {
  const category = project.category as
    | "foto"
    | "movement-direction"
    | "performance"
    | null;

  return (
    <div className="min-h-screen relative min-[1100px]:h-screen min-[1100px]:overflow-hidden">
      <HomeButton />

      {/* Mobile Layout (below 1100px) */}
      <div className="min-[1100px]:hidden flex flex-col">
        {/* Project Nav - Fixed overlay */}
        {category && categoryProjects && categoryProjects.length > 0 && (
          <div className="fixed top-0 left-0 p-2 z-10">
            <ProjectNav
              category={category}
              projects={categoryProjects}
              currentSlug={project.slug ?? undefined}
            />
          </div>
        )}

        {/* Left Images - Full Width */}
        <div className="w-full">
          <MediaColumnRenderer
            column={project.leftColumn as MediaColumn}
            side="left"
            projectTitle={project.title ?? undefined}
          />
        </div>

        {/* Project Info */}
        <div className="flex flex-col items-start text-left px-2 py-6">
          {project.title && (
            <h1 className="text-[10px] md:text-sm font-medium mb-4">{project.title}</h1>
          )}
          {project.description && (
            <PortableText
              value={project.description}
              className="text-[10px] md:text-xs mb-6"
            />
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
                    rel={
                      link.linkType === "external"
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="block text-[10px] md:text-xs hover:opacity-60 transition-opacity uppercase"
                  >
                    <span className="mr-1">→</span>
                    {link.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Images - Full Width */}
        <div className="w-full">
          <MediaColumnRenderer
            column={project.rightColumn as MediaColumn}
            side="left"
            projectTitle={project.title ?? undefined}
          />
        </div>
      </div>

      {/* Desktop Layout (1100px and larger) */}
      <div className="hidden min-[1100px]:grid h-full grid-cols-[1.2fr_0.6fr_1.2fr]">
        <div className="relative overflow-y-auto">
          {category && categoryProjects && categoryProjects.length > 0 && (
            <div className="fixed top-0 left-0 p-2 z-10">
              <ProjectNav
                category={category}
                projects={categoryProjects}
                currentSlug={project.slug ?? undefined}
              />
            </div>
          )}
          <MediaColumnRenderer
            column={project.leftColumn as MediaColumn}
            side="left"
            projectTitle={project.title ?? undefined}
          />
        </div>
        <div className="overflow-y-auto flex flex-col items-start text-left px-4 pt-1">
          {project.title && (
            <h1 className="text-sm font-medium mb-4">{project.title}</h1>
          )}
          {project.description && (
            <PortableText
              value={project.description}
              className="text-xs mb-6"
            />
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
                    rel={
                      link.linkType === "external"
                        ? "noopener noreferrer"
                        : undefined
                    }
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
          <MediaColumnRenderer
            column={project.rightColumn as MediaColumn}
            side="right"
            projectTitle={project.title ?? undefined}
          />
        </div>
      </div>

      <Footer
        leftText={settings?.footerLeftText}
        centerText={settings?.footerCenterText}
        rightText={settings?.footerRightText}
      />
    </div>
  );
}
