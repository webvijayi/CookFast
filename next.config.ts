import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    allowedDevOrigins: [
      "http://3000-idx-docs-generator-1744546436209.cluster-mwrgkbggpvbq6tvtviraw2knqg.cloudworkstations.dev"
    ],
  },
};

export default nextConfig;
