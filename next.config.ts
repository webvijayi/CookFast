import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export', // Enable static export
  basePath: isGithubActions ? '/CookFast' : undefined, // Set basePath for GitHub Pages
  images: {
    unoptimized: true, // Disable image optimization for static export
  },
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
