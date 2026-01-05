"use client";

import Link from "next/link";
import { usePageTransition } from "./PageTransition";

type TransitionLinkProps = React.ComponentProps<typeof Link>;

export default function TransitionLink({
  href,
  onClick,
  children,
  ...props
}: TransitionLinkProps) {
  const { navigate, isTransitioning } = usePageTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isTransitioning) return;

    if (onClick) {
      onClick(e);
    }

    const hrefString = typeof href === "string" ? href : href.pathname || "/";
    navigate(hrefString);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
