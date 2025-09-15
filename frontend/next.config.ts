import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
  }
};

export default nextConfig;
