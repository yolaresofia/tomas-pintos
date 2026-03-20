"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartYRef = useRef(0);

  const dismissVideo = useCallback(() => {
    setPhase("complete");
    onComplete();
  }, [onComplete]);

  const handleVideoEnd = dismissVideo;
  const handleVideoClick = dismissVideo;

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
      className={`fixed inset-0 z-50 overflow-hidden ${phase === "video" ? "cursor-pointer bg-white" : "bg-[#E72B1C]"}`}
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

      {/* Video layer */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className={autoplayFailed ? "hidden" : ""}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          muted
          playsInline
          preload="auto"
          onEnded={handleVideoEnd}
          aria-hidden="true"
        />
      )}

      {/* Poster fallback - shown when autoplay fails (e.g. iOS Low Power Mode) */}
      {autoplayFailed && posterUrl && phase === "video" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterUrl}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          aria-hidden="true"
        />
      )}

      {/* Red curtain overlay */}
      {phase === "curtain" && (
        <div className="absolute inset-0 bg-[#E72B1C] z-[1]" />
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