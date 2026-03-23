"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const INTRO_SEEN_KEY = "tomas-pintos-intro-seen";

type IntroClientProps = {
  leftText?: string;
  rightText?: string;
};

export default function IntroClient({
  leftText = "TOMAS",
  rightText = "PINTOS",
}: IntroClientProps) {
  const router = useRouter();
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [shouldShow, setShouldShow] = useState<boolean | null>(null);

  const goToHome = useCallback(() => {
    sessionStorage.setItem(INTRO_SEEN_KEY, "true");
    router.replace("/home");
  }, [router]);

  // Check if intro was already seen
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem(INTRO_SEEN_KEY);
    if (hasSeenIntro) {
      router.replace("/home");
    } else {
      setShouldShow(true);
    }
  }, [router]);

  // Start curtain animation
  useEffect(() => {
    if (!shouldShow) return;
    const timer = setTimeout(() => setCurtainOpen(true), 500);
    return () => clearTimeout(timer);
  }, [shouldShow]);

  // After curtain opens, navigate to /home
  useEffect(() => {
    if (!curtainOpen) return;
    const timer = setTimeout(goToHome, 1200);
    return () => clearTimeout(timer);
  }, [curtainOpen, goToHome]);

  // Don't render anything until we know whether to show
  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#E72B1C]">
      <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-end pointer-events-none">
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
