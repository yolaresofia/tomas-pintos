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
  const [isHovered, setIsHovered] = useState(false);
  const [showArrow, setShowArrow] = useState(false);

  // Ease in the arrow after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowArrow(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const label = categoryLabels[category] || category.toUpperCase();
  const basePath = categoryPaths[category] || `/${category}`;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-1 cursor-pointer">
        <span className="text-[9px] md:text-sm font-semibold tracking-wider">{label}</span>
        <span
          className={`text-[9px] md:text-sm transition-opacity duration-500 ${
            showArrow ? "opacity-100" : "opacity-0"
          }`}
        >
          ↓
        </span>
      </div>

      {/* Dropdown */}
      <ul
        className={`text-[9px] md:text-sm leading-tight transition-opacity duration-300 mt-1 ${
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
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
