import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Add this experimental block to allow the development server origin
  experimental: {
    allowedDevOrigins: [
      // Add the specific origin from the warning message
      "http://3000-idx-docs-generator-1744546436209.cluster-mwrgkbggpvbq6tvtviraw2knqg.cloudworkstations.dev"
      // You might add other origins if needed, e.g., for Codespaces
    ],
  },
};

export default nextConfig;
