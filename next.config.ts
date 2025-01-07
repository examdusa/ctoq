import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        // port: '',
        // pathname: '/account123/**',
        search: '',
      }
    ]
  },
  reactStrictMode: false
};

export default nextConfig;
