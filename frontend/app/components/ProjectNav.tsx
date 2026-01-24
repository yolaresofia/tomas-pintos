"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = `project-nav-menu-${category}`;

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

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setIsOpen(true);
          setFocusedIndex(0);
        }
        return;
      }

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          closeMenu();
          buttonRef.current?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < projects.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : projects.length - 1
          );
          break;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusedIndex(projects.length - 1);
          break;
        case "Tab":
          closeMenu();
          break;
      }
    },
    [isOpen, projects.length, closeMenu]
  );

  // Focus management for menu items
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && menuRef.current) {
      const items = menuRef.current.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');
      items[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  return (
    <nav
      className="relative"
      onMouseEnter={() => isDesktop && setIsOpen(true)}
      onMouseLeave={() => isDesktop && closeMenu()}
      aria-label={`${label} projects navigation`}
    >
      <button
        ref={buttonRef}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
        className={`flex items-center gap-1 cursor-pointer hover:text-[#E72B1C] transition-colors ${
          isOpen ? "text-[#E72B1C]" : ""
        }`}
      >
        <span className="text-[11px] md:text-sm font-extrabold min-[1100px]:font-semibold tracking-wider">{label}</span>
        <span
          className={`text-[11px] md:text-sm transition-opacity duration-500 ${
            showArrow ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          ↓
        </span>
      </button>

      {/* Dropdown */}
      <ul
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-label={`${label} projects`}
        onKeyDown={handleKeyDown}
        className={`text-[13px] space-y-3 min-[1100px]:space-y-0 md:text-sm leading-tight transition-opacity duration-300 mt-1 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {projects.map((project, index) => {
          const isCurrentProject = project.slug === currentSlug;
          return (
            <li key={project._id} role="none">
              <TransitionLink
                href={`${basePath}/${project.slug}`}
                role="menuitem"
                tabIndex={isOpen ? 0 : -1}
                aria-current={isCurrentProject ? "page" : undefined}
                className={`hover:text-[#E72B1C] transition-colors focus-visible:outline-2 focus-visible:outline-[#E72B1C] focus-visible:outline-offset-2 ${
                  isCurrentProject ? "font-medium" : ""
                } ${focusedIndex === index ? "text-[#E72B1C]" : ""}`}
                onClick={() => closeMenu()}
              >
                {project.title}
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
