"use client";

import { useState, useEffect, useRef } from "react";
import { useBackgroundChange } from "@/app/about/AboutBackground";

const COLORS = ["#F6E301", "#011588", "#E72B1C"];

export default function AnimatedStar({ className }: { className?: string }) {
  const [isHovering, setIsHovering] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onBackgroundChange = useBackgroundChange();

  useEffect(() => {
    if (isHovering) {
      indexRef.current = 0;
      onBackgroundChange(COLORS[0]);
      intervalRef.current = setInterval(() => {
        indexRef.current = (indexRef.current + 1) % COLORS.length;
        onBackgroundChange(COLORS[indexRef.current]);
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      onBackgroundChange(null);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovering, onBackgroundChange]);

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
        fill="white"
      />
    </svg>
  );
}
