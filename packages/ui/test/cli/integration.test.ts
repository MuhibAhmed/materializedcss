import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, beforeEach, afterEach, describe, expect, it } from "vitest";

import { runAdd } from "../../src/cli/commands/add.ts";
import { runDiff } from "../../src/cli/commands/diff.ts";
import { runInit } from "../../src/cli/commands/init.ts";
import { runList } from "../../src/cli/commands/list.ts";
import type { Prompter } from "../../src/cli/utils/prompt.ts";
import { buildTestRegistry, createTestContext, makeTempDir, packageRoot, read, removeDir, writeTree } from "./helpers.ts";

let registry: string;

beforeAll(() => {
  registry = makeTempDir("mcss-registry-");
  buildTestRegistry(registry);
});
afterAll(() => removeDir(registry));

/** A Next.js-style project with `@/*` → `./src/*`. */
function scaffold(dir: string, overrides: Record<string, string> = {}): void {
  writeTree(dir, {
    "package.json": JSON.stringify({ name: "app", dependencies: { next: "16.0.0", react: "19.2.0", clsx: "^2.1.1" } }, null, 2),
    "tsconfig.json": '{\n  // comment\n  "compilerOptions": {\n    "paths": { "@/*": ["./src/*"] },\n  },\n}\n',
    "src/app/globals.css": '@import "tailwindcss";\n\nbody { margin: 0; }\n',
    "src/app/page.tsx": "export default function Page() { return null; }\n",
    ...overrides,
  });
}

describe("init + add (command functions)", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeTempDir();
    scaffold(dir);
  });
  afterEach(() => removeDir(dir));

  it("initialises a Next.js project and adds button with its dependencies", async () => {
    const context = createTestContext();
    const init = await runInit({ cwd: dir, yes: true, skipInstall: true, registry }, context);

    const config = JSON.parse(read(dir, "materialized.json")) as Record<string, unknown>;
    expect(config).toMatchObject({
      style: "default",
      rsc: true,
      tsx: true,
      tailwind: { css: "src/app/globals.css", cssVariables: true },
      aliases: { components: "@/components", ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks", utils: "@/lib/utils" },
    });
    expect(read(dir, "src/lib/utils.ts")).toContain("export function cn(");
    expect(read(dir, "src/app/globals.css")).toBe(
      '@import "tailwindcss";\n@import "materializedcss/theme.css";\n\nbody { margin: 0; }\n',
    );
    // clsx is already declared; the theme import needs the package itself.
    expect(init.dependencies).toEqual(expect.arrayContaining(["tailwind-merge", "class-variance-authority"]));
    expect(init.dependencies.some((dep) => dep.startsWith("materializedcss@"))).toBe(true);
    expect(init.dependencies).not.toContain("clsx");
    expect(context.installs).toEqual([]);

    // Running init again changes nothing in the stylesheet.
    await runInit({ cwd: dir, yes: true, skipInstall: true, registry }, context);
    expect(read(dir, "src/app/globals.css").match(/materializedcss\/theme\.css/g)).toHaveLength(1);

    const add = await runAdd({ cwd: dir, components: ["button"], yes: true, skipInstall: true }, context);
    expect(add.items).toEqual(["utils", "use-ripple", "button"]);
    const button = read(dir, "src/components/ui/button.tsx");
    expect(button.startsWith('"use client";')).toBe(true);
    expect(button).toContain('from "@/hooks/use-ripple"');
    expect(button).toContain('from "@/lib/utils"');
    expect(existsSync(path.join(dir, "src/hooks/use-ripple.ts"))).toBe(true);
    expect(add.files.find((file) => file.target.endsWith("utils.ts"))?.status).toBe("unchanged");
    expect(add.dependencies).toEqual(expect.arrayContaining(["radix-ui", "class-variance-authority"]));
  });

  it("rewrites imports to custom aliases and strips use client without RSC", async () => {
    scaffold(dir, {
      "package.json": JSON.stringify({ name: "app", devDependencies: { vite: "^7.0.0" } }),
      "tsconfig.json": '{ "compilerOptions": { "baseUrl": ".", "paths": { "~/*": ["./src/*"] } } }',
      "src/index.css": '@import "tailwindcss";\n',
    });
    const context = createTestContext();
    writeFileSync(
      path.join(dir, "materialized.json"),
      JSON.stringify({
        rsc: false,
        tailwind: { css: "src/index.css" },
        aliases: { components: "~/widgets", ui: "~/widgets/md", lib: "~/core", hooks: "~/core/hooks", utils: "~/core/cn" },
        registry,
      }),
    );
    const result = await runAdd({ cwd: dir, components: ["button"], yes: true, skipInstall: true }, context);
    expect(result.files.map((file) => path.relative(dir, file.target).split(path.sep).join("/"))).toEqual([
      "src/core/cn.ts",
      "src/core/hooks/use-ripple.ts",
      "src/widgets/md/button.tsx",
    ]);
    const button = read(dir, "src/widgets/md/button.tsx");
    expect(button).not.toContain("use client");
    expect(button).toContain('from "~/core/hooks/use-ripple"');
    expect(button).toContain('from "~/core/cn"');
    expect(button).not.toContain("@/");
  });

  it("skips changed files with --yes, overwrites with --overwrite, and reports them in diff", async () => {
    const context = createTestContext();
    await runInit({ cwd: dir, yes: true, skipInstall: true, registry }, context);
    await runAdd({ cwd: dir, components: ["button"], yes: true, skipInstall: true }, context);

    const file = path.join(dir, "src/components/ui/button.tsx");
    const original = readFileSync(file, "utf8");
    writeFileSync(file, original.replace("export function Button", "// local tweak\nexport function Button"));

    const diff = await runDiff({ cwd: dir }, context);
    expect(diff.changed).toEqual(["button"]);
    expect(diff.diffs[0]?.patch).toContain("-// local tweak");

    const skipped = await runAdd({ cwd: dir, components: ["button"], yes: true, skipInstall: true }, context);
    expect(skipped.files.find((entry) => entry.target === file)?.status).toBe("skipped");
    expect(readFileSync(file, "utf8")).toContain("// local tweak");

    const asked: string[] = [];
    const decline: Prompter = {
      confirm: async (message) => {
        asked.push(message);
        return false;
      },
      text: async (_message, initial) => initial,
      multiselect: async () => [],
    };
    await runAdd({ cwd: dir, components: ["button"], skipInstall: true }, createTestContext(decline));
    expect(asked).toHaveLength(1);
    expect(asked[0]).toContain("src/components/ui/button.tsx");

    const updated = await runAdd({ cwd: dir, components: ["button"], overwrite: true, skipInstall: true }, context);
    expect(updated.files.find((entry) => entry.target === file)?.status).toBe("updated");
    expect(readFileSync(file, "utf8")).toBe(original);
    expect((await runDiff({ cwd: dir }, context)).changed).toEqual([]);
  });

  it("supports --dry-run, --path and installs dependencies in one call", async () => {
    const context = createTestContext();
    await runInit({ cwd: dir, yes: true, skipInstall: true, copyTheme: true, registry }, context);
    expect(read(dir, "src/app/globals.css")).toContain('@import "./materializedcss-theme.css";');
    expect(read(dir, "src/app/materializedcss-theme.css")).toContain("--primary");

    const dry = await runAdd({ cwd: dir, components: ["button"], yes: true, dryRun: true }, context);
    expect(dry.files.every((entry) => entry.status === "created" || entry.status === "unchanged")).toBe(true);
    expect(existsSync(path.join(dir, "src/components/ui/button.tsx"))).toBe(false);
    expect(context.installs).toEqual([]);

    await runAdd({ cwd: dir, components: ["button"], yes: true, path: "src/design" }, context);
    expect(existsSync(path.join(dir, "src/design/button.tsx"))).toBe(true);
    expect(context.installs).toHaveLength(1);
    expect(context.installs[0]).toEqual(expect.arrayContaining(["radix-ui", "class-variance-authority", "tailwind-merge"]));
  });

  it("fails with an actionable error for unknown components and missing Tailwind", async () => {
    const context = createTestContext();
    await runInit({ cwd: dir, yes: true, skipInstall: true, registry }, context);
    await expect(runAdd({ cwd: dir, components: ["buton"], yes: true }, context)).rejects.toThrow(/Unknown component: buton/);

    const bare = makeTempDir();
    try {
      writeTree(bare, { "package.json": "{}", "src/index.css": "body {}\n" });
      await expect(runInit({ cwd: bare, defaults: true, skipInstall: true, registry }, createTestContext())).rejects.toThrow(
        /does not import Tailwind CSS v4/,
      );
    } finally {
      removeDir(bare);
    }
  });

  it("lists components by category", async () => {
    const context = createTestContext();
    const result = await runList({ cwd: dir, registry }, context);
    expect(result.categories.some(({ items }) => items.some((entry) => entry.name === "button"))).toBe(true);
    expect(result.categories.flatMap(({ items }) => items).some((entry) => entry.name === "utils")).toBe(false);
  });
});

const builtCli = path.join(packageRoot, "dist", "cli", "index.js");

describe.skipIf(!existsSync(builtCli))("built CLI (dist/cli/index.js)", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeTempDir();
    scaffold(dir);
  });
  afterEach(() => removeDir(dir));

  const run = (...args: string[]): { status: number | null; stdout: string; stderr: string } => {
    const result = spawnSync(process.execPath, [builtCli, ...args], { cwd: dir, encoding: "utf8", env: { ...process.env, FORCE_COLOR: "0" } });
    return { status: result.status, stdout: result.stdout, stderr: result.stderr };
  };

  it("runs init and add with the bundled registry", () => {
    expect(run("--version").stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
    const init = run("init", "--yes", "--skip-install");
    expect(init.status, init.stderr).toBe(0);
    const add = run("add", "button", "--yes", "--skip-install");
    expect(add.status, add.stderr).toBe(0);
    expect(read(dir, "src/components/ui/button.tsx")).toContain('from "@/hooks/use-ripple"');
    expect(existsSync(path.join(dir, "src/hooks/use-ripple.ts"))).toBe(true);
    expect(existsSync(path.join(dir, "src/lib/utils.ts"))).toBe(true);
    expect(read(dir, "src/app/globals.css")).toContain('@import "materializedcss/theme.css";');
  });

  it("exits non-zero with a hint for unknown commands and components", () => {
    run("init", "--yes", "--skip-install");
    const unknown = run("add", "nope", "--yes", "--skip-install");
    expect(unknown.status).toBe(1);
    expect(unknown.stderr).toContain("Unknown component");
    expect(run("frobnicate").status).not.toBe(0);
  });
});
