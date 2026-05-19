import type { NextConfig } from "next";
import path from "node:path";

// Pin the app root so Turbopack does not walk up to /htdocs (many sibling lockfiles).
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
