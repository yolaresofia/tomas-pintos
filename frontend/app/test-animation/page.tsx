"use client"

import { useState, useEffect } from "react"

export default function TestAnimation() {
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Symbols Container */}
        <div className="flex items-center justify-center mb-8 relative w-full">
          {/* Left Parenthesis */}
          <span
            className={`text-6xl font-bold text-black absolute transition-all duration-700 ease-in-out ${
              isAnimated ? "transform -translate-x-[700px] opacity-80" : "transform -translate-x-15"
            }`}
          >
            (☩
          </span>
          {/* Star Symbol - stays in center */}
          <span className="text-6xl font-bold text-black absolute transition-all duration-700 ease-in-out">✩</span>

          {/* Heart Symbol */}
          <span
            className={`text-6xl font-bold text-black absolute transition-all duration-700 ease-in-out ${
              isAnimated ? "transform translate-x-[700px]" : "transform translate-x-15"
            }`}
          >
            ♡)
          </span>
        </div>

        {/* Name Container */}
        <div className="absolute bottom-20 w-full flex justify-center">
          <span
            className={`text-4xl font-bold text-black tracking-wider transition-all duration-700 ease-in-out ${
              isAnimated ? "transform -translate-x-[580px]" : ""
            }`}
          >
            TOMAS
          </span>

          <span
            className={`text-4xl font-bold text-black tracking-wider ml-4 transition-all duration-700 ease-in-out ${
              isAnimated ? "transform translate-x-[580px]" : ""
            }`}
          >
            PINTOS
          </span>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setIsAnimated(false)
            setTimeout(() => setIsAnimated(true), 2000)
          }}
          className="absolute top-8 right-8 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Restart Animation
        </button>
      </div>
    </>
  )
}
