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

  // Preload the video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    video.load();
  }, [videoUrl]);

  // Transition from curtain to video phase after curtain opens
  useEffect(() => {
    if (!curtainOpen) return;

    const timer = setTimeout(() => {
      if (videoUrl) {
        setPhase("video");
        const video = videoRef.current;
        if (video) {
          const attemptPlay = () => {
            video.play().catch(() => {
              // Autoplay blocked (low power mode etc.) — skip to homepage
              dismissVideo();
            });
          };
          if (video.readyState >= 2) {
            attemptPlay();
          } else {
            video.addEventListener("canplay", attemptPlay, { once: true });
          }
        }
      } else {
        // No video URL — skip to homepage
        setPhase("complete");
        onComplete();
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [curtainOpen, videoUrl, onComplete, dismissVideo]);

  // Handle scroll/touch/keyboard to dismiss video
  useEffect(() => {
    if (phase !== "video") return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchCurrentY = e.touches[0].clientY;
      const diff = Math.abs(touchCurrentY - touchStartYRef.current);
      if (diff > 30) {
        dismissVideo();
      }
    };

    const handleWheel = () => {
      dismissVideo();
    };

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
      className={`fixed inset-0 z-50 overflow-hidden bg-[#E72B1C] ${phase === "video" ? "cursor-pointer" : ""}`}
      onClick={phase === "video" ? handleVideoClick : undefined}
      role="region"
      aria-label="Intro animation"
      aria-live="polite"
    >
      {/* Video layer — hidden during curtain, visible during video phase */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className={`absolute inset-0 w-full h-full object-cover ${phase !== "video" ? "opacity-0" : "opacity-100"}`}
          muted
          playsInline
          preload="auto"
          onEnded={handleVideoEnd}
          aria-hidden="true"
        />
      )}

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-end pointer-events-none z-20">
        <span
          className={`text-[11px] md:text-sm font-extrabold min-[1100px]:font-semibold tracking-wider transition-transform duration-700 ease-in-out ${
            curtainOpen ? "" : "translate-x-[calc(50vw-100%-8px)]"
          }`}
        >
          {leftText}
        </span>
        <span
          className={`text-[11px] md:text-sm font-extrabold min-[1100px]:font-semibold tracking-wider transition-transform duration-700 ease-in-out ${
            curtainOpen ? "" : "-translate-x-[calc(50vw-100%-8px)]"
          }`}
        >
          {rightText}
        </span>
      </div>
    </div>
  );
}
