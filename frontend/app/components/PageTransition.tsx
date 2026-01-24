"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useEffect,
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

export default function PageTransition({ children }: PageTransitionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [, startTransition] = useTransition();
  const navigateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fade in on initial mount and when pathname changes (after navigation)
  useEffect(() => {
    // Content is already hidden from the navigate() fade-out, just fade in
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsTransitioning(false);
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Cleanup navigate timeout on unmount
  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
      }
    };
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return;

      setIsTransitioning(true);
      setIsVisible(false);

      // Clear any pending navigation timeout
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
      }

      // Wait for fade out, then navigate
      navigateTimeoutRef.current = setTimeout(() => {
        startTransition(() => {
          router.push(href);
        });
      }, 200);
    },
    [pathname, router]
  );

  // Memoize context value to prevent unnecessary consumer re-renders
  const contextValue = useMemo(
    () => ({ navigate, isTransitioning }),
    [navigate, isTransitioning]
  );

  return (
    <TransitionContext.Provider value={contextValue}>
      <div
        className={`transition-opacity duration-300 ease-in-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </TransitionContext.Provider>
  );
}
