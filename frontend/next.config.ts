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
    domains: ["api.real-estate.ai-developer.site","localhost","images.pexels.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.real-estate.ai-developer.site",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname : "/**",
      }
    ],
  },

};

export default nextConfig;
