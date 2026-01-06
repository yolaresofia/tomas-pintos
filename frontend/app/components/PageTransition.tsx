"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useTransition,
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

  // Fade in on initial mount and when pathname changes (after navigation)
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsTransitioning(false);
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return;

      setIsTransitioning(true);
      setIsVisible(false);

      // Wait for fade out, then navigate
      setTimeout(() => {
        startTransition(() => {
          router.push(href);
        });
      }, 200);
    },
    [pathname, router]
  );

  return (
    <TransitionContext.Provider value={{ navigate, isTransitioning }}>
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
