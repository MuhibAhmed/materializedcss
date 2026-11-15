import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  detectAliasPrefix,
  detectCssFile,
  detectFramework,
  getProjectInfo,
  majorVersion,
  parseJsonc,
  readTsConfig,
  resolveAlias,
} from "../../src/cli/utils/project.ts";
import { makeTempDir, removeDir, writeTree } from "./helpers.ts";

describe("parseJsonc", () => {
  it("handles comments, trailing commas and comment-like strings", () => {
    const text = `{
      // line comment
      "compilerOptions": {
        /* block
           comment */
        "baseUrl": ".", // trailing
        "paths": { "@/*": ["./src/*",], },
        "url": "https://example.com/*not a comment*/",
        "quote": "a \\"quoted\\" // value",
      },
    }`;
    expect(parseJsonc(text)).toEqual({
      compilerOptions: {
        baseUrl: ".",
        paths: { "@/*": ["./src/*"] },
        url: "https://example.com/*not a comment*/",
        quote: 'a "quoted" // value',
      },
    });
  });

  it("accepts a BOM", () => {
    expect(parseJsonc('﻿{"a": 1}')).toEqual({ a: 1 });
  });
});

describe("readTsConfig", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => removeDir(dir));

  it("reads paths from tsconfig.json with comments", () => {
    writeTree(dir, {
      "tsconfig.json": '{\n  // Next.js\n  "compilerOptions": { "paths": { "@/*": ["./src/*"] }, },\n}',
    });
    const info = readTsConfig(dir);
    expect(info?.paths).toEqual({ "@/*": ["./src/*"] });
    expect(info?.pathsBase).toBe(dir);
  });

  it("follows extends (relative, without .json) and resolves paths against the base config's baseUrl", () => {
    writeTree(dir, {
      "config/tsconfig.base.json": '{ "compilerOptions": { "baseUrl": "..", "paths": { "~/*": ["app/*"] } } }',
      "tsconfig.json": '{ "extends": "./config/tsconfig.base", "compilerOptions": { "strict": true } }',
    });
    const info = readTsConfig(dir);
    expect(info?.paths).toEqual({ "~/*": ["app/*"] });
    expect(info?.pathsBase).toBe(dir);
    expect(detectAliasPrefix(info)).toBe("~");
  });

  it("lets the child config override paths and supports extends arrays", () => {
    writeTree(dir, {
      "a.json": '{ "compilerOptions": { "paths": { "#/*": ["./a/*"] } } }',
      "b.json": '{ "compilerOptions": { "target": "ES2022" } }',
      "tsconfig.json": '{ "extends": ["./a.json", "./b.json"], "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }',
    });
    expect(readTsConfig(dir)?.paths).toEqual({ "@/*": ["./src/*"] });
  });

  it("finds paths in project references (Vite's tsconfig.app.json)", () => {
    writeTree(dir, {
      "tsconfig.json": '{ "files": [], "references": [{ "path": "./tsconfig.node.json" }, { "path": "./tsconfig.app.json" }] }',
      "tsconfig.node.json": '{ "compilerOptions": {} }',
      "tsconfig.app.json": '{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } } }',
    });
    const info = readTsConfig(dir);
    expect(info?.file).toBe(path.join(dir, "tsconfig.app.json"));
    expect(info?.paths["@/*"]).toEqual(["./src/*"]);
  });

  it("falls back to jsconfig.json", () => {
    writeTree(dir, { "jsconfig.json": '{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }' });
    expect(readTsConfig(dir)?.paths).toEqual({ "@/*": ["./*"] });
  });

  it("returns undefined without a config", () => {
    expect(readTsConfig(dir)).toBeUndefined();
  });
});

describe("resolveAlias", () => {
  const cwd = path.resolve("/project");
  const tsconfig = { file: path.join(cwd, "tsconfig.json"), pathsBase: cwd, paths: { "@/*": ["./src/*"], "@ui": ["./packages/ui/src"] } };

  it("maps wildcard aliases through tsconfig paths", () => {
    expect(resolveAlias("@/components/ui", { cwd, tsconfig, srcDir: true })).toEqual({
      path: path.join(cwd, "src", "components", "ui"),
      matched: true,
    });
    expect(resolveAlias("@/lib/utils", { cwd, tsconfig, srcDir: true }).path).toBe(path.join(cwd, "src", "lib", "utils"));
  });

  it("maps exact aliases and their sub-paths", () => {
    expect(resolveAlias("@ui/button", { cwd, tsconfig, srcDir: true }).path).toBe(path.join(cwd, "packages", "ui", "src", "button"));
  });

  it("guesses src/ or the root when nothing matches", () => {
    expect(resolveAlias("~/hooks", { cwd, tsconfig: undefined, srcDir: true })).toEqual({
      path: path.join(cwd, "src", "hooks"),
      matched: false,
    });
    expect(resolveAlias("@/hooks", { cwd, tsconfig: undefined, srcDir: false }).path).toBe(path.join(cwd, "hooks"));
  });
});

describe("project detection", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => removeDir(dir));

  it("detects frameworks from dependencies", () => {
    expect(detectFramework({ dependencies: { next: "16.0.0", react: "19" } })).toBe("next");
    expect(detectFramework({ devDependencies: { vite: "^7" } })).toBe("vite");
    expect(detectFramework({ devDependencies: { "@react-router/dev": "^7", vite: "^7" } })).toBe("react-router");
    expect(detectFramework({ dependencies: { astro: "^5" } })).toBe("astro");
    expect(detectFramework({})).toBe("other");
  });

  it("parses major versions", () => {
    expect(majorVersion("^4.1.0")).toBe(4);
    expect(majorVersion("~3.4")).toBe(3);
    expect(majorVersion("4")).toBe(4);
    expect(majorVersion("latest")).toBeUndefined();
  });

  it("prefers a stylesheet that imports Tailwind", () => {
    writeTree(dir, { "src/App.css": ".app {}", "src/styles/globals.css": '@import "tailwindcss";' });
    expect(detectCssFile(dir)).toBe("src/styles/globals.css");
  });

  it("detects a Next.js App Router project", () => {
    writeTree(dir, {
      "package.json": JSON.stringify({ dependencies: { next: "16", tailwindcss: "^4.1.0" } }),
      "tsconfig.json": '{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }',
      "src/app/globals.css": '@import "tailwindcss";\n',
    });
    const info = getProjectInfo(dir);
    expect(info).toMatchObject({
      framework: "next",
      srcDir: true,
      appDir: true,
      rsc: true,
      aliasPrefix: "@",
      cssFile: "src/app/globals.css",
      cssHasTailwind: true,
      tailwindMajor: 4,
    });
  });

  it("requires a package.json", () => {
    expect(() => getProjectInfo(dir)).toThrow(/No package.json/);
  });
});
