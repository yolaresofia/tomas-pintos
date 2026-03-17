"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

// Global Lenis instance for body scroll (about page, mobile)
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Prevent double-init in React strict mode
    if (lenisRef.current) return;

    // Respect user's reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    // Check if there are nested Lenis scroll containers on the page
    // If so, skip body-level Lenis to avoid conflicts
    const hasNestedScrollers =
      document.querySelectorAll("[data-lenis-scroller]").length > 0;
    if (hasNestedScrollers) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }
    rafIdRef.current = requestAnimationFrame(raf);

    requestAnimationFrame(() => lenis.resize());

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}

// Hook to apply Lenis to a specific scroll container.
// The containerRef should point to the overflow wrapper element.
// Its first child element is used as the content (for scroll height measurement).
export function useLenisScroller(
  containerRef: React.RefObject<HTMLElement | null>
) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const wrapper = containerRef.current;
    if (!wrapper || lenisRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    // Content must be a child element so Lenis can measure its full height
    // against the wrapper's visible height
    const content = wrapper.firstElementChild as HTMLElement | null;
    if (!content) return;

    const lenis = new Lenis({
      wrapper,
      content,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      orientation: "vertical",
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }
    rafIdRef.current = requestAnimationFrame(raf);

    // Resize after images may have loaded
    requestAnimationFrame(() => lenis.resize());

    // Also resize when images finish loading, since they change content height
    const images = wrapper.querySelectorAll("img");
    const onLoad = () => lenis.resize();
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", onLoad, { once: true });
      }
    });

    return () => {
      images.forEach((img) => img.removeEventListener("load", onLoad));
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [containerRef]);
}
