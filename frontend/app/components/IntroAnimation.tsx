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

  const handleVideoEnd = useCallback(() => {
    setPhase("complete");
    onComplete();
  }, [onComplete]);

  const handleVideoClick = useCallback(() => {
    setPhase("complete");
    onComplete();
  }, [onComplete]);

  // Start curtain animation after mount
  useEffect(() => {
    const curtainTimer = setTimeout(() => {
      setCurtainOpen(true);
    }, 500);

    return () => clearTimeout(curtainTimer);
  }, []);

  // Transition from curtain to video phase after curtain opens
  useEffect(() => {
    if (curtainOpen) {
      const videoTimer = setTimeout(() => {
        setPhase("video");
        // Start playing video
        if (videoRef.current) {
          videoRef.current.play().catch(() => {
            // If autoplay fails, still allow click to proceed
          });
        }
      }, 700); // Wait for curtain animation to complete

      return () => clearTimeout(videoTimer);
    }
  }, [curtainOpen]);

  // If no video URL, skip to complete after curtain
  useEffect(() => {
    if (!videoUrl && curtainOpen) {
      const skipTimer = setTimeout(() => {
        setPhase("complete");
        onComplete();
      }, 700);

      return () => clearTimeout(skipTimer);
    }
  }, [videoUrl, curtainOpen, onComplete]);

  // Handle scroll/touch to dismiss video on mobile
  useEffect(() => {
    if (phase !== "video") return;

    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchCurrentY = e.touches[0].clientY;
      const diff = Math.abs(touchCurrentY - touchStartY);
      // If user scrolls more than 30px, dismiss the video
      if (diff > 30) {
        setPhase("complete");
        onComplete();
      }
    };

    const handleWheel = () => {
      setPhase("complete");
      onComplete();
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [phase, onComplete]);

  if (phase === "complete") {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${phase === "video" ? "cursor-pointer" : ""}`}
      onClick={phase === "video" ? handleVideoClick : undefined}
    >
      {/* Video layer - behind curtain */}
      {videoUrl && (
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-500 ${
            phase === "video" ? "opacity-100" : "opacity-0"
          }`}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            muted
            playsInline
            onEnded={handleVideoEnd}
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
