import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";
// import withPWAInit from "next-pwa";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// const withPWA = withPWAInit({
//   dest: "public",
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === "development",
//   swSrc: "public/sw.js",
// });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "localhost",
      "images.unsplash.com",
      "api.real-estate.ai-developer.site",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.real-estate.ai-developer.site",
        port: "",
        pathname: "/images/Properties/original/**",
      },
    ],
  },
};

export default nextConfig;
