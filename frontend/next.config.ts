import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";
import withPWAInit from "next-pwa";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",

  // ❌ REMOVE THIS — it causes the build error
  // swSrc: "public/sw.js",

  // ⬅ Tell next-pwa NOT to overwrite custom service worker
  buildExcludes: [/public\/sw\.js$/],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
    ],
    domains: ["localhost"],
  },
};

export default withPWA(nextConfig);
