"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useCallback,
  useMemo,
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

  // Simple navigation - no fade out, just navigate directly
  // Next.js handles the transition naturally
  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return;
      router.push(href);
    },
    [pathname, router]
  );

  const contextValue = useMemo(
    () => ({ navigate, isTransitioning: false }),
    [navigate]
  );

  return (
    <TransitionContext.Provider value={contextValue}>
      {children}
    </TransitionContext.Provider>
  );
}