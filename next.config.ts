import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone", // Only uncomment when building for Docker production
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
