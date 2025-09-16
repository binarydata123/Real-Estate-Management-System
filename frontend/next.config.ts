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
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withPWA(nextConfig);
