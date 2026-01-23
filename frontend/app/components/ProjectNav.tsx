"use client";

import { useState, useEffect } from "react";

import TransitionLink from "@/app/components/TransitionLink";

type Project = {
  _id: string;
  title: string | null;
  slug: string | null;
};

type ProjectNavProps = {
  category: "foto" | "movement-direction" | "performance";
  projects: Project[];
  currentSlug?: string;
};

const categoryLabels: Record<string, string> = {
  foto: "FOTO",
  "movement-direction": "MOVEMENT DIRECTION",
  performance: "PERFORMANCE",
};

const categoryPaths: Record<string, string> = {
  foto: "/foto",
  "movement-direction": "/movement-direction",
  performance: "/performance",
};

export default function ProjectNav({ category, projects, currentSlug }: ProjectNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Ease in the arrow after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowArrow(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Check if we're on desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1100);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const label = categoryLabels[category] || category.toUpperCase();
  const basePath = categoryPaths[category] || `/${category}`;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => isDesktop && setIsOpen(true)}
      onMouseLeave={() => isDesktop && setIsOpen(false)}
    >
      <button
        onClick={handleToggle}
        className={`flex items-center gap-1 cursor-pointer hover:text-[#E72B1C] transition-colors ${
          isOpen ? "text-[#E72B1C]" : ""
        }`}
      >
        <span className="text-[11px] md:text-sm font-extrabold min-[1100px]:font-semibold tracking-wider">{label}</span>
        <span
          className={`text-[11px] md:text-sm transition-opacity duration-500 ${
            showArrow ? "opacity-100" : "opacity-0"
          }`}
        >
          ↓
        </span>
      </button>

      {/* Dropdown */}
      <ul
        className={`text-[13px] space-y-3 min-[1100px]:space-y-0 md:text-sm leading-tight transition-opacity duration-300 mt-1 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {projects.map((project) => {
          const isCurrentProject = project.slug === currentSlug;
          return (
            <li key={project._id}>
              <TransitionLink
                href={`${basePath}/${project.slug}`}
                className={`hover:text-[#E72B1C] transition-colors ${
                  isCurrentProject ? "font-medium" : ""
                }`}
              >
                {project.title}
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
