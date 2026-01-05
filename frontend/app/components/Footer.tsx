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
    <footer className={`p-6 flex justify-between items-end ${className}`}>
      <TransitionLink
        href="/"
        className="text-base font-medium tracking-wider hover:opacity-60 transition-opacity"
      >
        {leftText || "TOMAS"}
      </TransitionLink>
      <TransitionLink
        href="/"
        className="text-base hover:opacity-60 transition-opacity"
      >
        {centerText || "(ABOUT)"}
      </TransitionLink>
      <TransitionLink
        href="/"
        className="text-base font-medium tracking-wider hover:opacity-60 transition-opacity"
      >
        {rightText || "PINTOS"}
      </TransitionLink>
    </footer>
  );
}
