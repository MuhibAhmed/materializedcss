#!/usr/bin/env node
// End-to-end smoke test for the materializedcss package and CLI.
//
//   node scripts/cli-smoke.mjs [--out <dir>] [--skip-build] [--only button,card]
//
// 1. Builds packages/ui and packs it with `npm pack`.
// 2. CLI mode: scaffolds a Vite + React 19 + Tailwind v4 + TypeScript app, installs the
//    tarball, runs `materializedcss init --yes` and `materializedcss add ... --yes`,
//    renders the components, then runs `tsc --noEmit` and `vite build`.
// 3. npm-package mode: a second app imports { Button } from "materializedcss" and
//    `@import "materializedcss/styles.css"`, builds, and checks that Tailwind generated
//    the component classes from the package (the `@source` in styles.css works).
//
// `npm install` only ever runs inside the output directory. Exits non-zero on failure.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uiRoot = path.join(repoRoot, "packages", "ui");

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};

const outDir = path.resolve(value("--out") ?? path.join(os.tmpdir(), "materializedcss-cli-smoke"));
const only = value("--only")?.split(",").filter(Boolean);
const isWindows = process.platform === "win32";

function log(message) {
  console.log(`\n\x1b[36m▶ ${message}\x1b[0m`);
}

/** Run a command, streaming output; throws on a non-zero exit. */
function run(command, commandArgs, cwd, options = {}) {
  console.log(`\x1b[2m$ ${command} ${commandArgs.join(" ")}   (in ${path.relative(repoRoot, cwd) || "."})\x1b[0m`);
  const quote = (arg) => (/[\s"]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg);
  // On Windows, run one command line through the shell (npm.cmd/npx.cmd) instead of passing args (DEP0190).
  const [file, fileArgs] = isWindows ? [[command, ...commandArgs].map(quote).join(" "), []] : [command, commandArgs];
  const result = spawnSync(file, fileArgs, {
    cwd,
    stdio: options.capture ? ["ignore", "pipe", "inherit"] : "inherit",
    encoding: "utf8",
    shell: isWindows,
    env: cleanEnv(options.env),
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${commandArgs.join(" ")} failed with exit code ${result.status}`);
  }
  return result.stdout ?? "";
}

/** The parent npm's environment, minus variables that would leak into nested npm runs. */
function cleanEnv(extra = {}) {
  const env = { ...process.env, FORCE_COLOR: "1", ...extra };
  for (const key of Object.keys(env)) {
    if (/^npm_/i.test(key)) delete env[key];
  }
  return env;
}

function write(root, files) {
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
  console.log(`\x1b[32m✔ ${message}\x1b[0m`);
}

const pascal = (name) => name.replace(/(^|-)([a-z0-9])/g, (_m, _d, c) => c.toUpperCase());

/** Files shared by both apps: Vite + React 19 + Tailwind v4 + TypeScript. */
function viteApp(name, extraDependencies) {
  return {
    "package.json": JSON.stringify(
      {
        name,
        private: true,
        type: "module",
        scripts: { build: "vite build", typecheck: "tsc --noEmit -p tsconfig.json" },
        dependencies: { react: "^19.2.0", "react-dom": "^19.2.0", ...extraDependencies },
        devDependencies: {
          "@tailwindcss/vite": "^4.1.0",
          "@types/node": "^24.0.0",
          "@types/react": "^19.2.0",
          "@types/react-dom": "^19.2.0",
          "@vitejs/plugin-react": "latest",
          tailwindcss: "^4.1.0",
          typescript: "^7.0.0",
          vite: "latest",
        },
      },
      null,
      2,
    ),
    "tsconfig.json": `{
  // Vite + React app (JSONC on purpose: the CLI must parse comments and trailing commas)
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "types": ["vite/client"],
    "paths": { "@/*": ["./src/*"], },
  },
  "include": ["src"],
}
`,
    "vite.config.ts": `import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
`,
    "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    "src/main.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
  };
}

function cssBundle(appDir) {
  const assets = path.join(appDir, "dist", "assets");
  const css = readdirSync(assets).filter((file) => file.endsWith(".css"));
  return css.map((file) => readFileSync(path.join(assets, file), "utf8")).join("\n");
}

function main() {
  // 1. Build and pack.
  if (!flag("--skip-build")) {
    log("Building materializedcss");
    run("npm", ["run", "build", "-w", "materializedcss"], repoRoot);
  }
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  log("Packing");
  const packJson = run("npm", ["pack", "--json", "--pack-destination", outDir], uiRoot, { capture: true });
  const tarball = path.join(outDir, JSON.parse(packJson.slice(packJson.indexOf("[")))[0].filename);
  assert(existsSync(tarball), `packed ${path.basename(tarball)}`);
  const tarballSpec = `file:${tarball.split(path.sep).join("/")}`;

  // Components in the registry (items with a category).
  const registryDir = path.join(uiRoot, "dist", "registry");
  const index = JSON.parse(readFileSync(path.join(registryDir, "index.json"), "utf8"));
  const components = index
    .filter((item) => item.category)
    .map((item) => item.name)
    .filter((name) => !only || only.includes(name));

  // 2. CLI mode.
  const cliApp = path.join(outDir, "cli-app");
  log(`CLI mode: scaffolding ${cliApp}`);
  write(cliApp, {
    ...viteApp("cli-app", { materializedcss: tarballSpec }),
    "src/index.css": '@import "tailwindcss";\n\nbody {\n  font-family: Roboto, system-ui, sans-serif;\n}\n',
    "src/App.tsx": "export function App() {\n  return null;\n}\n",
  });
  run("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], cliApp);

  log("materializedcss init --yes");
  run("npx", ["--no-install", "materializedcss", "init", "--yes"], cliApp);
  const config = JSON.parse(readFileSync(path.join(cliApp, "materialized.json"), "utf8"));
  assert(config.tailwind.css === "src/index.css", "materialized.json points at src/index.css");
  assert(config.rsc === false, "rsc is false for Vite");
  assert(readFileSync(path.join(cliApp, "src/index.css"), "utf8").includes('@import "materializedcss/theme.css";'), "theme import added");
  assert(existsSync(path.join(cliApp, "src/lib/utils.ts")), "src/lib/utils.ts written");

  log("materializedcss add button --yes");
  run("npx", ["--no-install", "materializedcss", "add", "button", "--yes"], cliApp);
  const button = readFileSync(path.join(cliApp, "src/components/ui/button.tsx"), "utf8");
  assert(!button.includes('"use client"'), '"use client" stripped (rsc: false)');
  assert(button.includes('from "@/hooks/use-ripple"'), "button imports @/hooks/use-ripple");
  assert(existsSync(path.join(cliApp, "src/hooks/use-ripple.ts")), "src/hooks/use-ripple.ts written");

  const rest = components.filter((name) => name !== "button");
  if (rest.length) {
    log(`materializedcss add ${rest.join(" ")} --yes`);
    run("npx", ["--no-install", "materializedcss", "add", ...rest, "--yes"], cliApp);
  }
  log("materializedcss diff (expect no differences)");
  const diffOut = run("npx", ["--no-install", "materializedcss", "diff"], cliApp, { capture: true, env: { FORCE_COLOR: "0" } });
  console.log(diffOut);
  assert(!diffOut.includes("differ from the registry"), "local copies match the registry");

  // Render every component module: Button explicitly, the rest via namespace imports so
  // tsc type-checks them and Vite bundles them.
  const namespaces = components
    .filter((name) => existsSync(path.join(cliApp, "src/components/ui", `${name}.tsx`)))
    .map((name) => [pascal(name), name]);
  write(cliApp, {
    "src/App.tsx": `import { Button } from "@/components/ui/button";
${namespaces.map(([id, name]) => `import * as ${id}Module from "@/components/ui/${name}";`).join("\n")}

const modules = { ${namespaces.map(([id]) => `${id}Module`).join(", ")} };

export function App() {
  return (
    <main className="space-y-4 p-8">
      <Button>Raised</Button>
      <Button variant="flat">Flat</Button>
      <p className="text-muted-foreground">{Object.keys(modules).length} component modules loaded.</p>
    </main>
  );
}
`,
  });

  log("CLI mode: tsc --noEmit");
  run("npx", ["--no-install", "tsc", "--noEmit", "-p", "tsconfig.json"], cliApp);
  assert(true, "tsc --noEmit passed");
  log("CLI mode: vite build");
  run("npx", ["--no-install", "vite", "build"], cliApp);
  const cliCss = cssBundle(cliApp);
  assert(cliCss.includes("--primary"), "theme tokens are in the CSS bundle");
  assert(/\.shadow-z2/.test(cliCss), "component utilities (shadow-z2) were generated");

  // 3. npm-package mode.
  const npmApp = path.join(outDir, "npm-app");
  log(`npm-package mode: scaffolding ${npmApp}`);
  write(npmApp, {
    ...viteApp("npm-app", { materializedcss: tarballSpec }),
    "src/index.css": '@import "tailwindcss";\n@import "materializedcss/styles.css";\n',
    "src/App.tsx": `import { Button } from "materializedcss";
import { cn } from "materializedcss/utils";

export function App() {
  return (
    <main className={cn("p-8")}>
      <Button>Raised</Button>
      <Button variant="flat">Flat</Button>
    </main>
  );
}
`,
  });
  run("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], npmApp);
  log("npm-package mode: tsc --noEmit");
  run("npx", ["--no-install", "tsc", "--noEmit", "-p", "tsconfig.json"], npmApp);
  assert(true, "tsc --noEmit passed");
  log("npm-package mode: vite build");
  run("npx", ["--no-install", "vite", "build"], npmApp);
  const npmCss = cssBundle(npmApp);
  assert(npmCss.includes("--primary"), "theme tokens are in the CSS bundle");
  assert(/\.shadow-z2/.test(npmCss), "Tailwind scanned the package's components (@source)");

  console.log(`\n\x1b[32mSmoke test passed.\x1b[0m Apps are in ${outDir}`);
}

try {
  main();
} catch (error) {
  console.error(`\n\x1b[31m✖ ${error instanceof Error ? error.message : String(error)}\x1b[0m`);
  process.exit(1);
}
