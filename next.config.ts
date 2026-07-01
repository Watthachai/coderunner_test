import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle for the Docker runtime image.
  output: "standalone",
  // This workspace sits inside a parent repo that has its own lockfile, so pin
  // the tracing/workspace root to THIS project. Without it, Next infers a parent
  // dir and nests standalone/server.js under it, breaking the Dockerfile.
  outputFileTracingRoot: path.resolve(__dirname),
  turbopack: { root: path.resolve(__dirname) },
  images: {
    // The prototype loads product/slip photos straight from Unsplash.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
