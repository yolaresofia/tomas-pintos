"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type HomeVideoClientProps = {
  videoUrl: string | null | undefined;
  posterUrl: string | null | undefined;
  onComplete: () => void;
};

export default function HomeVideoClient({
  videoUrl,
  posterUrl,
  onComplete,
}: HomeVideoClientProps) {
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartYRef = useRef(0);

  const dismiss = useCallback(() => {
    setDismissed(true);
    onComplete();
  }, [onComplete]);

  // Attempt to play video on mount
  useEffect(() => {
    if (!videoUrl) {
      // No video, auto-dismiss after a moment to show poster
      if (posterUrl) {
        const timer = setTimeout(dismiss, 2000);
        return () => clearTimeout(timer);
      }
      dismiss();
      return;
    }

    const video = videoRef.current;
    if (!video) return;

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
  }, [videoUrl, posterUrl, dismiss]);

  // Auto-dismiss after 2s when showing fallback poster
  useEffect(() => {
    if (!autoplayFailed) return;
    const timer = setTimeout(dismiss, 2000);
    return () => clearTimeout(timer);
  }, [autoplayFailed, dismiss]);

  // Scroll/touch/keyboard to dismiss
  useEffect(() => {
    if (dismissed) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const diff = Math.abs(e.touches[0].clientY - touchStartYRef.current);
      if (diff > 30) dismiss();
    };

    const handleWheel = () => dismiss();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        dismiss();
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
  }, [dismissed, dismiss]);

  if (dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden cursor-pointer bg-black"
      onClick={dismiss}
      role="region"
      aria-label="Intro video"
    >
      {/* Video */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className={`absolute inset-0 w-full h-full ${autoplayFailed ? "hidden" : ""}`}
          style={{ objectFit: "cover" }}
          muted
          playsInline
          preload="auto"
          onEnded={dismiss}
          aria-hidden="true"
        />
      )}

      {/* Poster fallback */}
      {autoplayFailed && posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "cover" }}
          aria-hidden="true"
        />
      )}

      {/* No video at all, show poster */}
      {!videoUrl && posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "cover" }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
