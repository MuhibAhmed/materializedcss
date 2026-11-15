import path from "node:path";
import type { NextConfig } from "next";

const monorepoRoot = path.resolve(import.meta.dirname, "../..");

// Set for the GitHub Pages build (e.g. "/materializedcss"): exports a static site
// served from that subpath.
const pagesBasePath = process.env.PAGES_BASE_PATH?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Component sources live in packages/ui and are imported through the "@/…"
  // alias (exactly the paths users get from the CLI), so Turbopack must be
  // allowed to compile files outside this app.
  turbopack: {
    root: monorepoRoot,
    ...(pagesBasePath && {
      rules: {
        // Raw <img src="/images/…"> isn't basePath-aware like next/link is.
        "*.tsx": {
          loaders: [{ loader: path.join(import.meta.dirname, "lib/base-path-loader.cjs"), options: { basePath: pagesBasePath } }],
        },
      },
    }),
  },
  outputFileTracingRoot: monorepoRoot,
  // TypeScript 7 ships the native compiler without the JS API that `next build`
  // uses for type checking; types are checked with `npm run typecheck` (tsc 7).
  typescript: { ignoreBuildErrors: true },
  devIndicators: false,
  ...(pagesBasePath && {
    output: "export",
    basePath: pagesBasePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
