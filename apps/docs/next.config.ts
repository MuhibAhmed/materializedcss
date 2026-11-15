import path from "node:path";
import type { NextConfig } from "next";

const monorepoRoot = path.resolve(import.meta.dirname, "../..");

const nextConfig: NextConfig = {
  // Component sources live in packages/ui and are imported through the "@/…"
  // alias (exactly the paths users get from the CLI), so Turbopack must be
  // allowed to compile files outside this app.
  turbopack: { root: monorepoRoot },
  outputFileTracingRoot: monorepoRoot,
  // TypeScript 7 ships the native compiler without the JS API that `next build`
  // uses for type checking; types are checked with `npm run typecheck` (tsc 7).
  typescript: { ignoreBuildErrors: true },
  devIndicators: false,
};

export default nextConfig;
