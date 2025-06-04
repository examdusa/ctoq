import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        search: "",
      },
      {
        hostname: "files.stripe.com",
        search: "",
        protocol: "https",
      },
    ],
  },
  reactStrictMode: false,
};

export default nextConfig;
