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

  if (phase === "complete") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
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
            className="w-full h-full object-cover cursor-pointer"
            muted
            playsInline
            onClick={handleVideoClick}
            onEnded={handleVideoEnd}
          />
        </div>
      )}

      {/* Curtain layer */}
      <div
        className={`absolute inset-0 flex items-end justify-center pb-6 transition-opacity duration-500 ${
          phase === "video" ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{ backgroundColor: "#E72B1C" }}
      >
        <div className="flex">
          <span
            className={`text-base font-bold tracking-wider transition-transform duration-700 ease-in-out ${
              curtainOpen ? "-translate-x-[calc(50vw-100px)]" : ""
            }`}
          >
            {leftText}
          </span>
          <span
            className={`text-base font-bold tracking-wider ml-4 transition-transform duration-700 ease-in-out ${
              curtainOpen ? "translate-x-[calc(50vw-100px)]" : ""
            }`}
          >
            {rightText}
          </span>
        </div>
      </div>
    </div>
  );
}
