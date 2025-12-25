import Image from "next/image";
import Link from "next/link";

import { urlForImage, resolveExternalLink } from "@/sanity/lib/utils";

type PhotoItem = {
  _key: string;
  image: any;
  alt: string | null;
  displayMode: string | null;
};

type PhotoColumn = {
  photos: PhotoItem[] | null;
} | null;

type ExternalLinkItem = {
  _key: string;
  label: string | null;
  linkType: string | null;
  url: string | null;
  email: string | null;
};

type ProjectData = {
  _id: string;
  title: string | null;
  slug: string | null;
  category: string | null;
  description: string | null;
  relevantLinks: ExternalLinkItem[] | null;
  featuredImage: any;
  leftColumn: PhotoColumn;
  rightColumn: PhotoColumn;
};

type SettingsData = {
  footerLeftText: string | null;
  footerCenterText: string | null;
  footerRightText: string | null;
} | null;

type ProjectPageProps = {
  project: ProjectData;
  settings: SettingsData;
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

export default function ProjectPage({ project, settings }: ProjectPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content - Three Column Layout */}
      <div className="flex-1 grid grid-cols-3">
        {/* Left Column - Photos */}
        <div className="flex flex-col">
          <PhotoColumnRenderer column={project.leftColumn} side="left" />
        </div>

        {/* Center Column - Info */}
        <div className="flex flex-col items-center text-center px-4">
          {/* Title */}
          {project.title && (
            <h1 className="text-lg font-medium mb-4">{project.title}</h1>
          )}

          {/* Description */}
          {project.description && (
            <p className="text-sm leading-relaxed mb-6">{project.description}</p>
          )}

          {/* Relevant Links */}
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
                    className="block text-sm hover:opacity-60 transition-opacity underline"
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column - Photos */}
        <div className="flex flex-col">
          <PhotoColumnRenderer column={project.rightColumn} side="right" />
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 flex justify-between items-end">
        <Link href="/" className="text-sm font-medium tracking-wider hover:opacity-60 transition-opacity">
          {settings?.footerLeftText || "TOMAS"}
        </Link>
        <Link href="/about" className="text-sm hover:opacity-60 transition-opacity">
          {settings?.footerCenterText || "(ABOUT)"}
        </Link>
        <Link href="/" className="text-sm font-medium tracking-wider hover:opacity-60 transition-opacity">
          {settings?.footerRightText || "PINTOS"}
        </Link>
      </footer>
    </div>
  );
}
