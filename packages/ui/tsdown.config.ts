import path from "node:path";
import { defineConfig } from "tsdown";

const alias = { "@": path.resolve(import.meta.dirname, "src") };

export default defineConfig([
  {
    // Component library: one output module per source module so consumers can
    // deep-import (`materializedcss/button`) and bundlers can tree-shake.
    name: "lib",
    entry: ["src/index.ts", "src/lib/*.ts", "src/hooks/*.ts", "src/components/ui/*.tsx"],
    outDir: "dist",
    format: "esm",
    platform: "browser",
    target: "es2022",
    unbundle: true,
    // "use client" directives are preserved per module in unbundle mode.
    inputOptions: {
      onLog(level, log, handler) {
        if (log.code === "MODULE_LEVEL_DIRECTIVE") return;
        handler(level, log);
      },
    },
    dts: false,
    clean: false,
    fixedExtension: false,
    alias,
    copy: [
      { from: "src/styles/theme.css", to: "dist" },
      { from: "src/styles/styles.css", to: "dist" },
    ],
  },
  {
    // CLI: bundled into a single file so `npx materializedcss` installs nothing extra.
    name: "cli",
    entry: { index: "src/cli/index.ts" },
    outDir: "dist/cli",
    format: "esm",
    platform: "node",
    target: "node22",
    dts: false,
    clean: false,
    fixedExtension: false,
    alias,
    deps: { alwaysBundle: ["commander", "prompts", "kleur"] },
    banner: { js: "#!/usr/bin/env node" },
  },
]);
