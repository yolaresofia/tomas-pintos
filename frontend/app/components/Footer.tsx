"use client";

import TransitionLink from "@/app/components/TransitionLink";

type FooterProps = {
  leftText?: string | null;
  centerText?: string | null;
  rightText?: string | null;
  className?: string;
};

export default function Footer({
  leftText,
  centerText,
  rightText,
  className = "",
}: FooterProps) {
  return (
    <footer className={`fixed bottom-0 left-0 right-0 p-2 flex justify-between items-end pointer-events-none ${className}`}>
      <TransitionLink
        href="/"
        className="text-[9px] md:text-sm tracking-wider font-semibold hover:text-[#E72B1C] transition-colors pointer-events-auto"
      >
        {leftText || "TOMAS"}
      </TransitionLink>
      <TransitionLink
        href="/about"
        className="text-[9px] md:text-sm hover:text-[#E72B1C] font-semibold transition-colors pointer-events-auto"
      >
        {centerText || "(ABOUT)"}
      </TransitionLink>
      <TransitionLink
        href="/"
        className="text-[9px] md:text-sm tracking-wider font-semibold hover:text-[#E72B1C] transition-colors pointer-events-auto"
      >
        {rightText || "PINTOS"}
      </TransitionLink>
    </footer>
  );
}
