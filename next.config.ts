import type { NextConfig } from "next";
import withRspack from "next-rspack";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

if (isDev) {
  process.env.TURBOPACK = "auto";
}

export default isDev ? withRspack(nextConfig) : nextConfig;


