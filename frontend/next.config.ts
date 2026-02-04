import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
    SC_DISABLE_SPEEDY: "false",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
    // Use only webp to reduce transformations (avif is slower to encode)
    formats: ["image/webp"],
    // Reduced device sizes to minimize cache variations
    deviceSizes: [640, 828, 1200, 1920],
    // Reduced image sizes for thumbnails
    imageSizes: [64, 128, 256],
    // Cache images for 31 days to reduce cache reads/writes
    minimumCacheTTL: 2678400,
    // Limit quality options to reduce variations
    qualities: [75],
  },
};

export default nextConfig;
