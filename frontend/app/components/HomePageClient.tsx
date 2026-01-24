"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import TransitionLink from "@/app/components/TransitionLink";
import IntroAnimation from "./IntroAnimation";
import Footer from "./Footer";
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
  const [expandedSection, setExpandedSection] = useState<"foto" | "movement" | "performance" | null>("movement");
  const [activeBackground, setActiveBackground] = useState<"foto" | "movement" | "performance">("movement");
  // Initialize state from sessionStorage to avoid flash on return visits
  const [showIntro, setShowIntro] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(INTRO_SEEN_KEY) ? false : null;
  });
  const [contentVisible, setContentVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!sessionStorage.getItem(INTRO_SEEN_KEY);
  });

  useEffect(() => {
    // Only run on initial mount if state wasn't set by initializer
    if (showIntro === null) {
      const hasSeenIntro = sessionStorage.getItem(INTRO_SEEN_KEY);
      if (hasSeenIntro) {
        setShowIntro(false);
        setContentVisible(true);
      } else {
        setShowIntro(true);
      }
    }
  }, [showIntro]);

  const handleIntroComplete = () => {
    sessionStorage.setItem(INTRO_SEEN_KEY, "true");
    setShowIntro(false);
    setTimeout(() => {
      setContentVisible(true);
    }, 50);
  };

  const toggleSection = (section: "foto" | "movement" | "performance") => {
    if (expandedSection === section) {
      // Clicking on already expanded section - just close dropdown, keep background
      setExpandedSection(null);
    } else {
      // Clicking on different section - change both dropdown and background
      setExpandedSection(section);
      setActiveBackground(section);
    }
  };

  // Show intro by default during SSR/initial render to ensure FCP
  // This will be updated on client once sessionStorage is checked
  if (showIntro === null) {
    return (
      <div className="h-screen overflow-hidden bg-black">
        <IntroAnimation
          videoUrl={previewVideoUrl}
          onComplete={handleIntroComplete}
          leftText={settings?.footerLeftText || "TOMAS"}
          rightText={settings?.footerRightText || "PINTOS"}
        />
      </div>
    );
  }

  // Get the image URL for the active background section on mobile
  const getActiveBackgroundUrl = () => {
    switch (activeBackground) {
      case "foto":
        return fotoImageUrl;
      case "movement":
        return movementDirectionImageUrl;
      case "performance":
        return performanceImageUrl;
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      {showIntro && (
        <IntroAnimation
          videoUrl={previewVideoUrl}
          onComplete={handleIntroComplete}
          leftText={settings?.footerLeftText || "TOMAS"}
          rightText={settings?.footerRightText || "PINTOS"}
        />
      )}

      {/* Mobile/Tablet Layout (below 1100px) */}
      <div
        className={`min-[1100px]:hidden h-screen overflow-hidden flex flex-col transition-opacity duration-700 ${
          contentVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Full screen background image - stays visible even when dropdown is closed */}
        {getActiveBackgroundUrl() && (
          <div className="fixed inset-0 -z-10">
            <Image
              src={getActiveBackgroundUrl()!}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Fixed header row with all three categories */}
        <div className="fixed top-0 left-0 right-0 p-2 z-10">
          <div className="flex justify-between">
            {/* FOTO - Left */}
            <div className="flex flex-col">
              <button
                onClick={() => toggleSection("foto")}
                className={`text-[11px] md:text-sm font-extrabold tracking-wider text-left hover:text-[#E72B1C] transition-colors ${
                  expandedSection === "foto" ? "text-[#E72B1C]" : ""
                }`}
              >
                FOTO
              </button>
              <ul
                className={`text-[13px] space-y-3 min-[1100px]:space-y-0 md:text-sm leading-tight overflow-hidden transition-all duration-300 ${
                  expandedSection === "foto" ? "opacity-100 mt-1" : "max-h-0 opacity-0"
                }`}
              >
                {projects?.foto?.map((project) => (
                  <li key={project._id}>
                    <TransitionLink
                      href={`/foto/${project.slug}`}
                      className="hover:text-[#E72B1C] transition-colors"
                    >
                      {project.title}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* MOVEMENT DIRECTION - Center */}
            <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
              <button
                onClick={() => toggleSection("movement")}
                className={`text-[11px] md:text-sm font-extrabold tracking-wider text-center whitespace-nowrap hover:text-[#E72B1C] transition-colors ${
                  expandedSection === "movement" ? "text-[#E72B1C]" : ""
                }`}
              >
                MOVEMENT DIRECTION
              </button>
              <ul
                className={`text-[13px] space-y-3 min-[1100px]:space-y-0 md:text-sm leading-tight text-center overflow-hidden transition-all duration-300 ${
                  expandedSection === "movement" ? "max-h-[80vh] opacity-100 mt-1" : "max-h-0 opacity-0"
                }`}
              >
                {projects?.movementDirection?.map((project) => (
                  <li key={project._id}>
                    <TransitionLink
                      href={`/movement-direction/${project.slug}`}
                      className="hover:text-[#E72B1C] transition-colors"
                    >
                      {project.title}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* PERFORMANCE - Right */}
            <div className="flex flex-col items-end">
              <button
                onClick={() => toggleSection("performance")}
                className={`text-[11px] md:text-sm font-extrabold tracking-wider text-right hover:text-[#E72B1C] transition-colors ${
                  expandedSection === "performance" ? "text-[#E72B1C]" : ""
                }`}
              >
                PERFORMANCE
              </button>
              <ul
                className={`text-[13px] space-y-3 min-[1100px]:space-y-0 md:text-sm leading-tight text-right overflow-hidden transition-all duration-300 ${
                  expandedSection === "performance" ? "max-h-[80vh] opacity-100 mt-1" : "max-h-0 opacity-0"
                }`}
              >
                {projects?.performance?.map((project) => (
                  <li key={project._id}>
                    <TransitionLink
                      href={`/performance/${project.slug}`}
                      className="hover:text-[#E72B1C] transition-colors"
                    >
                      {project.title}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Footer */}
        <Footer
          leftText={settings?.footerLeftText}
          centerText={settings?.footerCenterText}
          rightText={settings?.footerRightText}
        />
      </div>

      {/* Desktop Layout (1100px and larger) */}
      <div
        className={`hidden min-[1100px]:grid h-screen grid-cols-3 transition-opacity duration-700 ${
          contentVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="relative p-2 flex flex-col"
          onMouseEnter={() => setHoveredColumn("foto")}
          onMouseLeave={() => setHoveredColumn(null)}
        >
          {fotoImageUrl && (
            <div className="absolute inset-0 -z-10">
              <Image
                src={fotoImageUrl}
                alt=""
                fill
                sizes="33vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          <h2 className="text-sm font-semibold tracking-wider cursor-default hover:text-[#E72B1C] transition-colors">FOTO</h2>
          <ul
            className={`text-sm transition-opacity duration-300 leading-tight ${
              hoveredColumn === "foto" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {projects?.foto?.map((project) => (
              <li key={project._id}>
                <TransitionLink
                  href={`/foto/${project.slug}`}
                  className="hover:text-[#E72B1C] transition-colors"
                >
                  {project.title}
                </TransitionLink>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-6">
            <span className="text-sm font-semibold tracking-wider">
              {settings?.footerLeftText || "TOMAS"}
            </span>
          </div>
        </div>
        <div
          className="relative p-2 flex flex-col items-center"
          onMouseEnter={() => setHoveredColumn("movement")}
          onMouseLeave={() => setHoveredColumn(null)}
        >
          {movementDirectionImageUrl && (
            <div className="absolute inset-0 -z-10">
              <Image
                src={movementDirectionImageUrl}
                alt=""
                fill
                sizes="33vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          <h2 className="text-sm font-semibold tracking-wider cursor-default hover:text-[#E72B1C] transition-colors">MOVEMENT DIRECTION</h2>
          <ul
            className={`text-sm text-center transition-opacity duration-300 leading-tight ${
              hoveredColumn === "movement" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {projects?.movementDirection?.map((project) => (
              <li key={project._id}>
                <TransitionLink
                  href={`/movement-direction/${project.slug}`}
                  className="hover:text-[#E72B1C] transition-colors"
                >
                  {project.title}
                </TransitionLink>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-6">
            <TransitionLink href="/about" className="text-sm font-semibold hover:text-[#E72B1C] transition-colors">
              {settings?.footerCenterText || "(ABOUT)"}
            </TransitionLink>
          </div>
        </div>
        <div
          className="relative p-2 flex flex-col items-end text-right"
          onMouseEnter={() => setHoveredColumn("performance")}
          onMouseLeave={() => setHoveredColumn(null)}
        >
          {performanceImageUrl && (
            <div className="absolute inset-0 -z-10">
              <Image
                src={performanceImageUrl}
                alt=""
                fill
                sizes="33vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          <h2 className="text-sm font-semibold tracking-wider cursor-default hover:text-[#E72B1C] transition-colors">PERFORMANCE</h2>
          <ul
            className={`text-sm transition-opacity duration-300 leading-tight ${
              hoveredColumn === "performance" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {projects?.performance?.map((project) => (
              <li key={project._id}>
                <TransitionLink
                  href={`/performance/${project.slug}`}
                  className="hover:text-[#E72B1C] transition-colors"
                >
                  {project.title}
                </TransitionLink>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-6">
            <span className="text-sm font-semibold tracking-wider">
              {settings?.footerRightText || "PINTOS"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
