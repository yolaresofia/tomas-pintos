"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

type IntroAnimationProps = {
  videoUrl: string | null | undefined;
  posterUrl: string | null | undefined;
  onComplete: () => void;
  leftText?: string;
  rightText?: string;
};

type AnimationPhase = "curtain" | "video" | "complete";

export default function IntroAnimation({
  videoUrl,
  posterUrl,
  onComplete,
  leftText = "TOMAS",
  rightText = "PINTOS",
}: IntroAnimationProps) {
  const [phase, setPhase] = useState<AnimationPhase>("curtain");
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartYRef = useRef(0);

  const dismissVideo = useCallback(() => {
    setPhase("complete");
    onComplete();
  }, [onComplete]);

  const handleVideoEnd = dismissVideo;
  const handleVideoClick = dismissVideo;

  // Sync iOS Safari theme-color with phase
  useEffect(() => {
    const color = phase === "video" ? "#000000" : "#E72B1C";
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = color;

    return () => {
      if (meta) meta.content = "#ffffff";
    };
  }, [phase]);

  useEffect(() => {
    const curtainTimer = setTimeout(() => {
      setCurtainOpen(true);
    }, 500);
    return () => clearTimeout(curtainTimer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    video.load();
  }, [videoUrl]);

  useEffect(() => {
    if (!curtainOpen) return;

    const timer = setTimeout(() => {
      if (videoUrl) {
        setPhase("video");
        const video = videoRef.current;
        if (video) {
          const attemptPlay = () => {
            video.play().catch(() => {
              setAutoplayFailed(true);
            });
          };
          if (video.readyState >= 2) {
            attemptPlay();
          } else {
            video.addEventListener("canplay", attemptPlay, { once: true });
          }
        }
      } else {
        setPhase("complete");
        onComplete();
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [curtainOpen, videoUrl, onComplete]);

  // Auto-dismiss after 2s when showing fallback poster
  useEffect(() => {
    if (!autoplayFailed || phase !== "video") return;
    const timer = setTimeout(dismissVideo, 2000);
    return () => clearTimeout(timer);
  }, [autoplayFailed, phase, dismissVideo]);

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
      className={`fixed inset-0 z-50 overflow-hidden ${phase === "video" ? "cursor-pointer" : ""}`}
      style={{ backgroundColor: phase === "video" ? "#000000" : "#E72B1C" }}
      onClick={phase === "video" ? handleVideoClick : undefined}
      role="region"
      aria-label="Intro animation"
      aria-live="polite"
    >
      {phase === "video" && (
        <span className="sr-only">
          Intro video playing. Press Enter, Space, or Escape to skip.
        </span>
      )}

      {/* Desktop: video element */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className={`absolute inset-0 w-full h-full object-cover hidden min-[1100px]:block ${autoplayFailed ? "!hidden" : ""}`}
          muted
          playsInline
          preload="auto"
          onEnded={handleVideoEnd}
          onPlaying={() => setVideoPlaying(true)}
          aria-hidden="true"
        />
      )}

      {/* Mobile: use Next.js Image which handles object-fit cover correctly on iOS */}
      {posterUrl && (
        <div className={`absolute inset-0 min-[1100px]:hidden ${phase !== "video" ? "opacity-0" : ""}`}>
          <Image
            src={posterUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Desktop poster fallback when autoplay fails */}
      {autoplayFailed && posterUrl && phase === "video" && (
        <div className="absolute inset-0 hidden min-[1100px]:block">
          <Image
            src={posterUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Red curtain overlay — fades to reveal video/image */}
      <div
        className="absolute inset-0 bg-[#E72B1C] transition-opacity duration-500"
        style={{
          opacity: phase === "curtain" || (phase === "video" && !videoPlaying && !autoplayFailed) ? 1 : 0,
          pointerEvents: phase === "curtain" ? "auto" : "none",
          zIndex: 1,
        }}
      />

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
