import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Resolve the workspace root for Turbopack (fixes missing next package)
  turbopack: {
    // Absolute path to the project root
    root: __dirname, // absolute path
  },
};

export default nextConfig;
