"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type IntroAnimationProps = {
  videoUrl: string | null | undefined;
  onComplete: () => void;
  leftText?: string;
  rightText?: string;
};

type AnimationPhase = "curtain" | "video" | "complete";

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

  // Memoized dismiss handler - stable reference
  const dismissVideo = useCallback(() => {
    setPhase("complete");
    onComplete();
  }, [onComplete]);

  const handleVideoEnd = dismissVideo;
  const handleVideoClick = dismissVideo;

  // Start curtain animation after mount
  useEffect(() => {
    const curtainTimer = setTimeout(() => {
      setCurtainOpen(true);
    }, 500);

    return () => clearTimeout(curtainTimer);
  }, []);

  // Transition from curtain to video phase (or complete if no video) after curtain opens
  useEffect(() => {
    if (!curtainOpen) return;

    const timer = setTimeout(() => {
      if (videoUrl) {
        setPhase("video");
        // Start playing video
        videoRef.current?.play().catch(() => {
          // If autoplay fails, still allow click to proceed
        });
      } else {
        // No video URL, skip to complete
        setPhase("complete");
        onComplete();
      }
    }, 700); // Wait for curtain animation to complete

    return () => clearTimeout(timer);
  }, [curtainOpen, videoUrl, onComplete]);

  // Handle scroll/touch/keyboard to dismiss video
  useEffect(() => {
    if (phase !== "video") return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchCurrentY = e.touches[0].clientY;
      const diff = Math.abs(touchCurrentY - touchStartYRef.current);
      // If user scrolls more than 30px, dismiss the video
      if (diff > 30) {
        dismissVideo();
      }
    };

    const handleWheel = () => {
      dismissVideo();
    };

    // Allow keyboard users to skip intro
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        dismissVideo();
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
  }, [phase, dismissVideo]);

  if (phase === "complete") {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 min-h-[100dvh] ${phase === "video" ? "cursor-pointer bg-white" : ""}`}
      onClick={phase === "video" ? handleVideoClick : undefined}
      role="region"
      aria-label="Intro animation"
      aria-live="polite"
    >
      {/* Screen reader announcement */}
      {phase === "video" && (
        <span className="sr-only">
          Intro video playing. Press Enter, Space, or Escape to skip.
        </span>
      )}

      {/* Video layer - behind curtain */}
      {videoUrl && (
        <div
          className={`absolute inset-0 min-h-[100dvh] bg-white transition-opacity duration-500 ${
            phase === "video" ? "opacity-100" : "opacity-0"
          }`}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full min-h-[100dvh] object-cover"
            muted
            playsInline
            onEnded={handleVideoEnd}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Curtain background layer - fades out */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
          phase === "video" ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundColor: "#E72B1C" }}
      />

      {/* Labels layer - stays visible on top of video */}
      <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-end pointer-events-none">
        <span
          className={`text-[11px] md:text-sm font-extrabold min-[1100px]:font-semibold tracking-wider transition-all duration-700 ease-in-out ${
            curtainOpen ? "opacity-100" : "opacity-0 translate-x-[calc(50vw-50%)]"
          }`}
        >
          {leftText}
        </span>
        <span
          className={`text-[11px] md:text-sm font-extrabold min-[1100px]:font-semibold tracking-wider transition-all duration-700 ease-in-out ${
            curtainOpen ? "opacity-100" : "opacity-0 -translate-x-[calc(50vw-50%)]"
          }`}
        >
          {rightText}
        </span>
      </div>
    </div>
  );
}
