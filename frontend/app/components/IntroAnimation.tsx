"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type IntroAnimationProps = {
  videoUrl: string | null | undefined;
  onComplete: () => void;
  leftText?: string;
  rightText?: string;
};

// curtain: red screen, TOMAS/PINTOS split
// video: desktop only — video plays, curtain fades out behind it
// fade-out: whole overlay fades out to reveal homepage
// done: unmounted
type AnimationPhase = "curtain" | "video" | "fade-out" | "done";

export default function IntroAnimation({
  videoUrl,
  onComplete,
  leftText = "TOMAS",
  rightText = "PINTOS",
}: IntroAnimationProps) {
  const [phase, setPhase] = useState<AnimationPhase>("curtain");
  const [curtainOpen, setCurtainOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartYRef = useRef(0);

  const fadeOutAndComplete = useCallback(() => {
    if (phase === "fade-out" || phase === "done") return;
    onComplete(); // homepage starts animate-fade-in (0.5s) behind the overlay
    // Wait for homepage to fully load/render, then fade out the overlay
    setTimeout(() => {
      setPhase("fade-out");
      setTimeout(() => setPhase("done"), 800);
    }, 500);
  }, [phase, onComplete]);

  // Start curtain animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setCurtainOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Preload the video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    video.load();
  }, [videoUrl]);

  // After curtain opens: mobile → fade out, desktop → play video
  useEffect(() => {
    if (!curtainOpen) return;

    const timer = setTimeout(() => {
      const isMobile = window.matchMedia("(max-width: 1099px)").matches;

      if (isMobile || !videoUrl) {
        // Mobile or no video: let homepage load behind overlay, then fade out
        onComplete();
        setTimeout(() => {
          setPhase("fade-out");
          setTimeout(() => setPhase("done"), 800);
        }, 500);
        return;
      }

      // Desktop: show video
      setPhase("video");
      const video = videoRef.current;
      if (video) {
        const attemptPlay = () => {
          video.play().catch(() => {
            // Autoplay blocked — let homepage load, then fade out
            onComplete();
            setTimeout(() => {
              setPhase("fade-out");
              setTimeout(() => setPhase("done"), 800);
            }, 500);
          });
        };
        if (video.readyState >= 2) {
          attemptPlay();
        } else {
          video.addEventListener("canplay", attemptPlay, { once: true });
        }
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [curtainOpen, videoUrl, onComplete]);

  // Handle scroll/touch/keyboard to dismiss video (desktop)
  useEffect(() => {
    if (phase !== "video") return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const diff = Math.abs(e.touches[0].clientY - touchStartYRef.current);
      if (diff > 30) fadeOutAndComplete();
    };

    const handleWheel = () => fadeOutAndComplete();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        fadeOutAndComplete();
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [phase, fadeOutAndComplete]);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-[#E72B1C] ${phase === "video" ? "cursor-pointer" : ""}`}
      style={{
        opacity: phase === "fade-out" ? 0 : 1,
        transition: "opacity 0.8s ease-out",
        pointerEvents: phase === "fade-out" ? "none" : "auto",
      }}
      onClick={phase === "video" ? fadeOutAndComplete : undefined}
      role="region"
      aria-label="Intro animation"
      aria-live="polite"
    >
      {/* Video layer — desktop only, fades in during video phase */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover hidden min-[1100px]:block"
          style={{
            opacity: phase === "video" || phase === "fade-out" ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
          muted
          playsInline
          preload="auto"
          onEnded={fadeOutAndComplete}
          aria-hidden="true"
        />
      )}

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-end pointer-events-none z-20">
        <span
          className={`text-[11px] md:text-sm font-extrabold min-[1100px]:font-semibold tracking-wider transition-transform duration-700 ease-out ${
            curtainOpen ? "" : "translate-x-[calc(50vw-100%-8px)]"
          }`}
        >
          {leftText}
        </span>
        <span
          className={`text-[11px] md:text-sm font-extrabold min-[1100px]:font-semibold tracking-wider transition-transform duration-700 ease-out ${
            curtainOpen ? "" : "-translate-x-[calc(50vw-100%-8px)]"
          }`}
        >
          {rightText}
        </span>
      </div>
    </div>
  );
}
