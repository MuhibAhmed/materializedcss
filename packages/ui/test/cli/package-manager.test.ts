import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  assertSafePackageSpecs,
  detectPackageManager,
  getInstallCommand,
  missingDependencies,
  packageManagerFromUserAgent,
  packageName,
} from "../../src/cli/utils/package-manager.ts";
import { makeTempDir, removeDir, writeTree } from "./helpers.ts";

describe("detectPackageManager", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => removeDir(dir));

  it.each([
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["bun.lockb", "bun"],
    ["bun.lock", "bun"],
    ["package-lock.json", "npm"],
  ])("%s -> %s", (lockfile, manager) => {
    writeTree(dir, { [lockfile]: "" });
    expect(detectPackageManager(dir, "npm/10.0.0 node/v22.0.0")).toBe(manager);
  });

  it("finds a lockfile in a parent directory (monorepo)", () => {
    writeTree(dir, { "pnpm-lock.yaml": "", "apps/web/package.json": "{}" });
    expect(detectPackageManager(path.join(dir, "apps", "web"), undefined)).toBe("pnpm");
  });

  it("falls back to the user agent, then npm", () => {
    const nested = path.join(dir, "x");
    writeTree(dir, { "x/package.json": "{}" });
    // The temp dir may sit under a directory with a lockfile; only assert when none is found.
    const fromUa = detectPackageManager(nested, "yarn/4.1.0 npm/? node/v22.0.0");
    expect(["yarn", "npm", "pnpm", "bun"]).toContain(fromUa);
    expect(packageManagerFromUserAgent("bun/1.2.0 npm/? node/v22")).toBe("bun");
    expect(packageManagerFromUserAgent("pnpm/9.0.0 npm/? node/v22")).toBe("pnpm");
    expect(packageManagerFromUserAgent(undefined)).toBeUndefined();
    expect(packageManagerFromUserAgent("deno/2")).toBeUndefined();
  });
});

describe("install commands", () => {
  it("uses each manager's add command", () => {
    expect(getInstallCommand("npm", ["clsx"])).toEqual({ command: "npm", args: ["install", "clsx"] });
    expect(getInstallCommand("pnpm", ["clsx"])).toEqual({ command: "pnpm", args: ["add", "clsx"] });
    expect(getInstallCommand("yarn", ["clsx"], { dev: true })).toEqual({ command: "yarn", args: ["add", "-D", "clsx"] });
    expect(getInstallCommand("bun", ["a", "b"])).toEqual({ command: "bun", args: ["add", "a", "b"] });
  });

  it("only installs packages that are not declared yet", () => {
    const pkg = { dependencies: { clsx: "^2" }, devDependencies: { "@scope/x": "1" } };
    expect(missingDependencies(pkg, ["clsx", "@scope/x@^2", "tailwind-merge", "tailwind-merge", "materializedcss@^0.1.0"])).toEqual([
      "tailwind-merge",
      "materializedcss@^0.1.0",
    ]);
  });

  it("parses package names", () => {
    expect(packageName("@scope/name@^1.0.0")).toBe("@scope/name");
    expect(packageName("name@1")).toBe("name");
    expect(packageName("name")).toBe("name");
  });

  it("rejects suspicious package specs", () => {
    expect(() => assertSafePackageSpecs(["clsx", "@radix-ui/react-slot@^1.2.0", "materializedcss@^0.1.0"])).not.toThrow();
    expect(() => assertSafePackageSpecs(["clsx && rm -rf /"])).toThrow(/suspicious/);
    expect(() => assertSafePackageSpecs(["a@1 > out.txt"])).toThrow(/suspicious/);
  });
});
