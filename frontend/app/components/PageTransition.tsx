"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useCallback,
  useTransition,
  useMemo,
  useRef,
} from "react";

type TransitionContextType = {
  navigate: (href: string) => void;
  isTransitioning: boolean;
};

const TransitionContext = createContext<TransitionContextType>({
  navigate: () => {},
  isTransitioning: false,
});

export function usePageTransition() {
  return useContext(TransitionContext);
}

type PageTransitionProps = {
  children: React.ReactNode;
};

// Transition duration in ms - used for both CSS and JS timing
const TRANSITION_DURATION = 300;

export default function PageTransition({ children }: PageTransitionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const navigateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return;

      const container = containerRef.current;
      if (!container) {
        // Fallback: navigate immediately if no container
        startTransition(() => {
          router.push(href);
        });
        return;
      }

      // Clear any pending navigation
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
      }

      // Trigger fade out via CSS class
      container.style.opacity = "0";

      // Wait for fade out, then navigate
      navigateTimeoutRef.current = setTimeout(() => {
        startTransition(() => {
          router.push(href);
          // Fade back in after navigation
          requestAnimationFrame(() => {
            if (container) {
              container.style.opacity = "1";
            }
          });
        });
      }, TRANSITION_DURATION);
    },
    [pathname, router, startTransition]
  );

  // Memoize context value to prevent unnecessary consumer re-renders
  const contextValue = useMemo(
    () => ({ navigate, isTransitioning: isPending }),
    [navigate, isPending]
  );

  return (
    <TransitionContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        style={{
          opacity: 1,
          transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
        }}
      >
        {children}
      </div>
    </TransitionContext.Provider>
  );
}