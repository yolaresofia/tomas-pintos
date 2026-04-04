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
        className="min-h-screen min-[1100px]:h-screen flex flex-col min-[1100px]:overflow-hidden"
        style={{
          backgroundColor: bgColor || defaultColor || "#E72B1C",
          transition: "background-color 0.3s ease-in-out",
        }}
      >
        {children}
      </div>
    </BgChangeContext.Provider>
  );
}
