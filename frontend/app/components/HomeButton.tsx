"use client";

import TransitionLink from "@/app/components/TransitionLink";

export default function HomeButton() {
  return (
    <TransitionLink
      href="/"
      className="fixed top-0 right-0 z-50 hover:opacity-60 transition-opacity p-3 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
      aria-label="Go to homepage"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="4" fill="#E72B1C" />
        <circle cx="8" cy="8" r="7.35" stroke="#E72B1C" strokeWidth="1.3" />
      </svg>
    </TransitionLink>
  );
}