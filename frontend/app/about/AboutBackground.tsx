"use client";

import { createContext, useContext, useState, useCallback } from "react";

const BgChangeContext = createContext<(color: string | null) => void>(() => {});

export function useBackgroundChange() {
  return useContext(BgChangeContext);
}

export default function AboutBackground({
  children,
  defaultColor,
}: {
  children: React.ReactNode;
  defaultColor?: string;
}) {
  const [bgColor, setBgColor] = useState<string | null>(null);

  const onBackgroundChange = useCallback((color: string | null) => {
    setBgColor(color);
  }, []);

  return (
    <BgChangeContext.Provider value={onBackgroundChange}>
      <div
        className="h-screen flex flex-col overflow-hidden"
        style={{
          backgroundColor: bgColor || defaultColor || "#E72B1C",
          transition: "background-color 0.4s ease-in-out",
        }}
      >
        {children}
      </div>
    </BgChangeContext.Provider>
  );
}
