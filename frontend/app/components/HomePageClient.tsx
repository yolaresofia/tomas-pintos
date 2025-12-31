"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import IntroAnimation from "./IntroAnimation";

type ProjectNavItem = {
  _id: string;
  title: string | null;
  slug: string | null;
};

type ProjectsData = {
  fotoSelectedWorks: ProjectNavItem[] | null;
  fotoEditorial: ProjectNavItem[] | null;
  movementDirection: ProjectNavItem[] | null;
  performance: ProjectNavItem[] | null;
};

type SettingsData = {
  footerLeftText: string | null;
  footerCenterText: string | null;
  footerRightText: string | null;
} | null;

type HomePageClientProps = {
  fotoImageUrl: string | null | undefined;
  movementDirectionImageUrl: string | null | undefined;
  performanceImageUrl: string | null | undefined;
  previewVideoUrl: string | null | undefined;
  projects: ProjectsData | null;
  settings: SettingsData;
};

export default function HomePageClient({
  fotoImageUrl,
  movementDirectionImageUrl,
  performanceImageUrl,
  previewVideoUrl,
  projects,
  settings,
}: HomePageClientProps) {
  const [hoveredColumn, setHoveredColumn] = useState<"foto" | "movement" | "performance" | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  const handleIntroComplete = () => {
    setShowIntro(false);
    // Small delay before fading in content
    setTimeout(() => {
      setContentVisible(true);
    }, 50);
  };

  return (
    <div className="min-h-screen">
      {/* Intro Animation */}
      {showIntro && (
        <IntroAnimation
          videoUrl={previewVideoUrl}
          onComplete={handleIntroComplete}
          leftText={settings?.footerLeftText || "TOMAS"}
          rightText={settings?.footerRightText || "PINTOS"}
        />
      )}

      {/* Three Column Layout */}
      <div
        className={`min-h-screen grid grid-cols-3 transition-opacity duration-700 ${
          contentVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Left Column - FOTO */}
        <div
          className="relative p-6 flex flex-col"
          onMouseEnter={() => setHoveredColumn("foto")}
          onMouseLeave={() => setHoveredColumn(null)}
        >
          {/* Background Image */}
          {fotoImageUrl && (
            <div className="absolute inset-0 -z-10">
              <Image
                src={fotoImageUrl}
                alt=""
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <h2 className="text-base font-bold tracking-wider cursor-default">FOTO</h2>

          {/* Projects - Only visible on hover */}
          <div
            className={`transition-opacity duration-300 ${
              hoveredColumn === "foto" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Selected Works */}

              <h3 className="text-base">
                <span>Selected works</span>
                <span className="ml-1">↑</span>
              </h3>
              <ul className="text-base pl-4">
                {projects?.fotoSelectedWorks?.map((project: ProjectNavItem) => (
                  <li key={project._id}>
                    <Link
                      href={`/foto/selected-works/${project.slug}`}
                      className="hover:opacity-60 transition-opacity"
                    >
                      {project.title}
                    </Link>
                  </li>
                ))}
              </ul>

            {/* Editorial */}
            <div>
              <h3 className="text-base mt-2">
                <span>Editorial</span>
                <span className="ml-1">↓</span>
              </h3>
              <ul className="text-base pl-4">
                {projects?.fotoEditorial?.map((project: ProjectNavItem) => (
                  <li key={project._id}>
                    <Link
                      href={`/foto/editorial/${project.slug}`}
                      className="hover:opacity-60 transition-opacity"
                    >
                      {project.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Left - TOMAS */}
          <div className="mt-auto pt-6">
            <span className="text-base font-bold tracking-wider">
              {settings?.footerLeftText || "TOMAS"}
            </span>
          </div>
        </div>

        {/* Center Column - MOVEMENT DIRECTION */}
        <div
          className="relative p-6 flex flex-col items-center"
          onMouseEnter={() => setHoveredColumn("movement")}
          onMouseLeave={() => setHoveredColumn(null)}
        >
          {/* Background Image */}
          {movementDirectionImageUrl && (
            <div className="absolute inset-0 -z-10">
              <Image
                src={movementDirectionImageUrl}
                alt=""
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <h2 className="text-base font-bold tracking-wider cursor-default">MOVEMENT DIRECTION</h2>

          {/* Projects - Only visible on hover */}
          <ul
            className={`text-base text-center transition-opacity duration-300 ${
              hoveredColumn === "movement" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {projects?.movementDirection?.map((project: ProjectNavItem) => (
              <li key={project._id}>
                <Link
                  href={`/movement-direction/${project.slug}`}
                  className="hover:opacity-60 transition-opacity"
                >
                  {project.title}
                </Link>
              </li>
            ))}
          </ul>

          {/* Footer Center - (ABOUT) */}
          <div className="mt-auto pt-6">
            <Link href="/about" className="text-base font-bold hover:opacity-60 transition-opacity">
              {settings?.footerCenterText || "(ABOUT)"}
            </Link>
          </div>
        </div>

        {/* Right Column - PERFORMANCE */}
        <div
          className="relative p-6 flex flex-col items-end text-right"
          onMouseEnter={() => setHoveredColumn("performance")}
          onMouseLeave={() => setHoveredColumn(null)}
        >
          {/* Background Image */}
          {performanceImageUrl && (
            <div className="absolute inset-0 -z-10">
              <Image
                src={performanceImageUrl}
                alt=""
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <h2 className="text-base font-bold tracking-wider cursor-default">PERFORMANCE</h2>

          {/* Projects - Only visible on hover */}
          <ul
            className={`text-base transition-opacity duration-300 ${
              hoveredColumn === "performance" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {projects?.performance?.map((project: ProjectNavItem) => (
              <li key={project._id}>
                <Link
                  href={`/performance/${project.slug}`}
                  className="hover:opacity-60 transition-opacity"
                >
                  {project.title}
                </Link>
              </li>
            ))}
          </ul>

          {/* Footer Right - PINTOS */}
          <div className="mt-auto pt-6">
            <span className="text-base font-bold tracking-wider">
              {settings?.footerRightText || "PINTOS"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
