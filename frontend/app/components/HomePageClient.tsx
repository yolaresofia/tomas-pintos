"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import TransitionLink from "@/app/components/TransitionLink";
import IntroAnimation from "./IntroAnimation";
import type { AllProjectsForNavQueryResult, SettingsQueryResult } from "@/sanity.types";

const INTRO_SEEN_KEY = "tomas-pintos-intro-seen";

type HomePageClientProps = {
  fotoImageUrl: string | null;
  movementDirectionImageUrl: string | null;
  performanceImageUrl: string | null;
  previewVideoUrl: string | null;
  projects: AllProjectsForNavQueryResult | null;
  settings: SettingsQueryResult;
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
  const [showIntro, setShowIntro] = useState<boolean | null>(null);
  const [contentVisible, setContentVisible] = useState(false);
  
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem(INTRO_SEEN_KEY);
    if (hasSeenIntro) {
      setShowIntro(false);
      setContentVisible(true);
    } else {
      setShowIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem(INTRO_SEEN_KEY, "true");
    setShowIntro(false);
    setTimeout(() => {
      setContentVisible(true);
    }, 50);
  };

  if (showIntro === null) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen">
      {showIntro && (
        <IntroAnimation
          videoUrl={previewVideoUrl}
          onComplete={handleIntroComplete}
          leftText={settings?.footerLeftText || "TOMAS"}
          rightText={settings?.footerRightText || "PINTOS"}
        />
      )}
      <div
        className={`min-h-screen grid grid-cols-3 transition-opacity duration-700 ${
          contentVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="relative p-6 flex flex-col"
          onMouseEnter={() => setHoveredColumn("foto")}
          onMouseLeave={() => setHoveredColumn(null)}
        >
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
          <ul
            className={`text-base transition-opacity duration-300 leading-tight ${
              hoveredColumn === "foto" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {projects?.foto?.map((project) => (
              <li key={project._id}>
                <TransitionLink
                  href={`/foto/${project.slug}`}
                  className="hover:opacity-60 transition-opacity"
                >
                  {project.title}
                </TransitionLink>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-6">
            <span className="text-base font-bold tracking-wider">
              {settings?.footerLeftText || "TOMAS"}
            </span>
          </div>
        </div>
        <div
          className="relative p-6 flex flex-col items-center"
          onMouseEnter={() => setHoveredColumn("movement")}
          onMouseLeave={() => setHoveredColumn(null)}
        >
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
          <ul
            className={`text-base text-center transition-opacity duration-300 leading-tight ${
              hoveredColumn === "movement" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {projects?.movementDirection?.map((project) => (
              <li key={project._id}>
                <TransitionLink
                  href={`/movement-direction/${project.slug}`}
                  className="hover:opacity-60 transition-opacity"
                >
                  {project.title}
                </TransitionLink>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-6">
            <TransitionLink href="/about" className="text-base font-bold hover:opacity-60 transition-opacity">
              {settings?.footerCenterText || "(ABOUT)"}
            </TransitionLink>
          </div>
        </div>
        <div
          className="relative p-6 flex flex-col items-end text-right"
          onMouseEnter={() => setHoveredColumn("performance")}
          onMouseLeave={() => setHoveredColumn(null)}
        >
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
          <ul
            className={`text-base transition-opacity duration-300 leading-tight ${
              hoveredColumn === "performance" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {projects?.performance?.map((project) => (
              <li key={project._id}>
                <TransitionLink
                  href={`/performance/${project.slug}`}
                  className="hover:opacity-60 transition-opacity"
                >
                  {project.title}
                </TransitionLink>
              </li>
            ))}
          </ul>
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
