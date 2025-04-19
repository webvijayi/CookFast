/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Increase timeout for static page generation
    staticPageGenerationTimeout: 180,
    // Add external packages for server components
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig; 