"use client";

import { useState, useEffect, useRef } from "react";

const COLORS = ["#E72B1C", "#59020B", "#ACC6DD", "#0047AB", "#E4007C"];

export default function AnimatedStar({ className }: { className?: string }) {
  const [isHovering, setIsHovering] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isHovering) {
      setColorIndex(0);
      intervalRef.current = setInterval(() => {
        setColorIndex((prev) => (prev + 1) % COLORS.length);
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setColorIndex(0); // Back to original red
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovering]);

  return (
    <svg
      viewBox="0 0 458 436"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <path
        d="M228.729 0L282.724 166.181H457.458L316.095 268.887L370.091 435.069L228.729 332.363L87.3662 435.069L141.362 268.887L-0.000579834 166.181H174.733L228.729 0Z"
        fill={COLORS[colorIndex]}
        style={{ transition: "fill 0.3s ease" }}
      />
    </svg>
  );
}
