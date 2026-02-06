"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { createPortal } from "react-dom";

import { urlForImage, resolveExternalLink } from "@/sanity/lib/utils";
import ProjectNav from "@/app/components/ProjectNav";
import { useLenisScroller } from "@/app/components/SmoothScroll";
import type {
  ProjectBySlugQueryResult,
  SettingsQueryResult,
} from "@/sanity.types";
import Footer from "./Footer";
import HomeButton from "./HomeButton";

// Lazy load VideoPlayer - only loaded when a project has videos
// ssr: false because it uses browser APIs (fullscreen, createPortal)
const VideoPlayer = dynamic(() => import("@/app/components/VideoPlayer"), {
  ssr: false,
});

// Lazy load PortableText - reduces initial bundle when description is empty
const PortableText = dynamic(
  () =>
    import("@/app/components/PortableText").then((mod) => ({
      default: mod.PortableText,
    })),
  { ssr: true }
);

// =============================================================================
// THUMBNAIL COMPONENT - Simple gallery thumbnail with fade-in on load
// =============================================================================

function GalleryThumbnail({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        className={`object-cover w-full h-auto cursor-pointer transition-opacity duration-500 ease-in-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
        onClick={onClick}
      />
    </div>
  );
}

// =============================================================================
// LIGHTBOX COMPONENT - Uses the same cached image, opens instantly
// =============================================================================

type LightboxImage = {
  src: string;
  alt: string;
};

function ImageLightbox({
  image,
  allImages,
  currentIndex,
  onClose,
  onNavigate,
}: {
  image: LightboxImage;
  allImages: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft" && allImages.length > 1) {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : allImages.length - 1;
        onNavigate(prevIndex);
      } else if (e.key === "ArrowRight" && allImages.length > 1) {
        const nextIndex = currentIndex < allImages.length - 1 ? currentIndex + 1 : 0;
        onNavigate(nextIndex);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, allImages.length, onNavigate]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose, isClosing]);

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer transition-all duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      {/* Image container - uses the same URL as the thumbnail so it's already cached */}
      <div
        className={`max-w-[90vw] max-h-[90vh] transition-transform duration-300 ease-out ${
          isVisible ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.src}
          alt={image.alt}
          className="object-contain max-w-full max-h-[90vh] w-auto h-auto cursor-default"
        />
      </div>
    </div>,
    document.body
  );
}

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
  onImageClick,
}: {
  column: MediaColumn;
  side: "left" | "right";
  projectTitle?: string;
  onImageClick?: (src: string, alt: string) => void;
}) {
  if (!column?.photos || column.photos.length === 0) return null;

  return (
    <div
      className={`flex flex-col ${side === "right" ? "items-end" : "items-start"}`}
    >
      {column.photos.map((item) => {
        // Handle video items
        if (item.isVideo && item.previewVideoUrl && item.fullVideoUrl) {
          return (
            <VideoPlayer
              key={item._key}
              previewVideoUrl={item.previewVideoUrl}
              fullVideoUrl={item.fullVideoUrl}
              alt={item.alt}
              title={projectTitle}
            />
          );
        }

        // Handle image items - same URL for grid and lightbox (already cached)
        const imageUrl = urlForImage(item.image)?.width(800).quality(80).url();
        if (!imageUrl) return null;

        return (
          <GalleryThumbnail
            key={item._key}
            src={imageUrl}
            alt={item.alt || ""}
            onClick={
              onImageClick
                ? () => onImageClick(imageUrl, item.alt || "")
                : () => {}
            }
          />
        );
      })}
    </div>
  );
}

// Helper to collect all images from columns for navigation
function collectAllImages(
  leftColumn: MediaColumn,
  rightColumn: MediaColumn
): LightboxImage[] {
  const images: LightboxImage[] = [];

  const processColumn = (column: MediaColumn) => {
    if (!column?.photos) return;
    for (const item of column.photos) {
      if (item.isVideo) continue;
      const imageUrl = urlForImage(item.image)?.width(800).quality(80).url();
      if (imageUrl) {
        images.push({
          src: imageUrl,
          alt: item.alt || "",
        });
      }
    }
  };

  processColumn(leftColumn);
  processColumn(rightColumn);
  return images;
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

  // Collect all images for lightbox navigation
  const allImages = collectAllImages(
    project.leftColumn as MediaColumn,
    project.rightColumn as MediaColumn
  );

  // Lightbox state (desktop only)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Refs for desktop scroll columns - Lenis smooth scroll
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const centerColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  // Apply Lenis smooth scroll to each column
  useLenisScroller(leftColumnRef);
  useLenisScroller(centerColumnRef);
  useLenisScroller(rightColumnRef);

  const handleImageClick = useCallback(
    (src: string, _alt: string) => {
      // Find the index of this image in allImages
      const index = allImages.findIndex((img) => img.src === src);
      if (index !== -1) {
        setLightboxIndex(index);
      }
    },
    [allImages]
  );

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const navigateLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

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
        <div className="h-screen flex flex-col items-start text-left px-2 py-6">
          {project.title && (
            <h1 className="text-[13px] min-[1100px]:text-sm font-medium mb-4">{project.title}</h1>
          )}
          {project.description && (
            <PortableText
              value={project.description}
              className="text-[13px] min-[1100px]:text-xs mb-6"
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
                    className="block text-[13px] min-[1100px]:text-xs hover:opacity-60 transition-opacity uppercase"
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
        <div ref={leftColumnRef} className="relative overflow-y-auto" data-lenis-scroller>
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
            onImageClick={handleImageClick}
          />
        </div>
        <div ref={centerColumnRef} className="overflow-y-auto flex flex-col items-start text-left px-4 pt-1" data-lenis-scroller>
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
        <div ref={rightColumnRef} className="overflow-y-auto" data-lenis-scroller>
          <MediaColumnRenderer
            column={project.rightColumn as MediaColumn}
            side="right"
            projectTitle={project.title ?? undefined}
            onImageClick={handleImageClick}
          />
        </div>
      </div>

      {/* Image Lightbox (desktop only) */}
      {lightboxIndex !== null && allImages[lightboxIndex] && (
        <ImageLightbox
          image={allImages[lightboxIndex]}
          allImages={allImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}

      <Footer
        leftText={settings?.footerLeftText}
        centerText={settings?.footerCenterText}
        rightText={settings?.footerRightText}
      />
    </div>
  );
}
