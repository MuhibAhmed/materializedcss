import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { hasTailwindImport } from "./css.ts";
import { dirExists, fileExists, readTextIfExists, toPosixRelative } from "./fs.ts";
import { CliError } from "./logger.ts";

export type Framework = "next" | "vite" | "react-router" | "astro" | "other";

export interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface TsConfigInfo {
  /** The tsconfig.json / jsconfig.json that was read. */
  file: string;
  /** Directory that `paths` targets are resolved against (baseUrl, or the declaring config's dir). */
  pathsBase: string;
  paths: Record<string, string[]>;
}

export interface ProjectInfo {
  cwd: string;
  packageJson: PackageJson;
  framework: Framework;
  /** The project keeps its code in `src/`. */
  srcDir: boolean;
  /** Next.js App Router project (an `app/` or `src/app/` directory). */
  appDir: boolean;
  /** Default for the `rsc` config flag. */
  rsc: boolean;
  tsconfig: TsConfigInfo | undefined;
  /** Import alias prefix from tsconfig paths, e.g. `@` for `@/*`. */
  aliasPrefix: string | undefined;
  /** Global CSS file relative to cwd (posix), if one was found. */
  cssFile: string | undefined;
  /** The CSS file contains `@import "tailwindcss"`. */
  cssHasTailwind: boolean;
  /** Major version of the `tailwindcss` dependency, when declared. */
  tailwindMajor: number | undefined;
}

export const FRAMEWORK_NAMES: Record<Framework, string> = {
  next: "Next.js",
  vite: "Vite",
  "react-router": "React Router",
  astro: "Astro",
  other: "React",
};

/** Places where frameworks and templates keep the global stylesheet, most specific first. */
export const CSS_CANDIDATES: readonly string[] = [
  "app/globals.css",
  "src/app/globals.css",
  "src/index.css",
  "src/styles/globals.css",
  "styles/globals.css",
  "src/globals.css",
  "src/styles/global.css",
  "styles/global.css",
  "app/app.css",
  "src/app.css",
  "src/App.css",
  "src/styles.css",
  "src/style.css",
  "src/main.css",
  "app/global.css",
  "index.css",
  "styles.css",
];

/* -------------------------------------------------------------------------- */
/* JSONC                                                                      */
/* -------------------------------------------------------------------------- */

/** Remove `//` and `/* *\/` comments and trailing commas, leaving strings intact. */
export function stripJsonComments(text: string): string {
  let out = "";
  let i = 0;
  const n = text.length;
  while (i < n) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      const end = endOfString(text, i);
      out += text.slice(i, end);
      i = end;
    } else if (ch === "/" && next === "/") {
      while (i < n && text[i] !== "\n") i++;
    } else if (ch === "/" && next === "*") {
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
    } else {
      out += ch;
      i++;
    }
  }
  return removeTrailingCommas(out);
}

/** Index just past the closing quote of the string starting at `start`. */
function endOfString(text: string, start: number): number {
  let i = start + 1;
  while (i < text.length) {
    if (text[i] === "\\") i += 2;
    else if (text[i] === '"') return i + 1;
    else i++;
  }
  return text.length;
}

function removeTrailingCommas(text: string): string {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"') {
      const end = endOfString(text, i);
      out += text.slice(i, end);
      i = end;
      continue;
    }
    if (ch === ",") {
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j] ?? "")) j++;
      if (text[j] === "}" || text[j] === "]") {
        i++;
        continue;
      }
    }
    out += ch;
    i++;
  }
  return out;
}

/** Parse JSON with comments and trailing commas (tsconfig.json style). */
export function parseJsonc(text: string): unknown {
  return JSON.parse(stripJsonComments(text.replace(/^﻿/, "")));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/* -------------------------------------------------------------------------- */
/* package.json                                                               */
/* -------------------------------------------------------------------------- */

export function readPackageJson(cwd: string): PackageJson | undefined {
  const text = readTextIfExists(path.join(cwd, "package.json"));
  if (text === undefined) return undefined;
  try {
    const parsed = JSON.parse(text) as unknown;
    return isRecord(parsed) ? (parsed as PackageJson) : {};
  } catch {
    throw new CliError(`Could not parse ${path.join(cwd, "package.json")}.`, { hint: "Fix the JSON syntax and try again." });
  }
}

export function allDependencies(pkg: PackageJson): Record<string, string> {
  return { ...pkg.peerDependencies, ...pkg.devDependencies, ...pkg.dependencies };
}

export function detectFramework(pkg: PackageJson): Framework {
  const deps = allDependencies(pkg);
  if (deps.next) return "next";
  if (deps.astro) return "astro";
  if (deps["@react-router/dev"]) return "react-router";
  if (deps.vite || deps["@vitejs/plugin-react"] || deps["@vitejs/plugin-react-swc"]) return "vite";
  return "other";
}

/** Major version from a semver range such as `^4.1.0`, `~4`, `4.x` or `latest`. */
export function majorVersion(range: string | undefined): number | undefined {
  if (!range) return undefined;
  const match = /(\d+)(?:\.|$|\s|x)/.exec(range.replace(/^[^\d]*/, ""));
  return match?.[1] !== undefined ? Number(match[1]) : undefined;
}

/* -------------------------------------------------------------------------- */
/* tsconfig.json / jsconfig.json                                              */
/* -------------------------------------------------------------------------- */

interface RawConfigChain {
  paths?: Record<string, string[]>;
  pathsDir?: string;
  baseUrl?: string;
}

function readJsoncFile(file: string): Record<string, unknown> {
  const text = readFileSync(file, "utf8");
  try {
    const parsed = parseJsonc(text);
    return isRecord(parsed) ? parsed : {};
  } catch (error) {
    throw new CliError(`Could not parse ${file}: ${(error as Error).message}`);
  }
}

/** Resolve an `extends` entry (relative path or package specifier) to a file. */
function resolveExtends(fromFile: string, specifier: string): string | undefined {
  const dir = path.dirname(fromFile);
  if (specifier.startsWith(".") || path.isAbsolute(specifier)) {
    const abs = path.resolve(dir, specifier);
    if (fileExists(abs)) return abs;
    if (fileExists(`${abs}.json`)) return `${abs}.json`;
    if (fileExists(path.join(abs, "tsconfig.json"))) return path.join(abs, "tsconfig.json");
    return undefined;
  }
  const require = createRequire(fromFile);
  for (const candidate of [specifier, `${specifier}.json`, `${specifier}/tsconfig.json`]) {
    try {
      return require.resolve(candidate);
    } catch {
      // try the next form
    }
  }
  return undefined;
}

function loadConfigChain(file: string, seen: Set<string> = new Set()): RawConfigChain {
  if (seen.has(file)) return {};
  seen.add(file);
  const json = readJsoncFile(file);
  const dir = path.dirname(file);

  let result: RawConfigChain = {};
  const ext = json.extends;
  const bases = typeof ext === "string" ? [ext] : Array.isArray(ext) ? ext.filter((e): e is string => typeof e === "string") : [];
  for (const base of bases) {
    const resolved = resolveExtends(file, base);
    if (resolved) result = { ...result, ...stripUndefined(loadConfigChain(resolved, seen)) };
  }

  const options = isRecord(json.compilerOptions) ? json.compilerOptions : {};
  if (typeof options.baseUrl === "string") result.baseUrl = path.resolve(dir, options.baseUrl);
  if (isRecord(options.paths)) {
    const paths: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(options.paths)) {
      if (Array.isArray(value)) paths[key] = value.filter((v): v is string => typeof v === "string");
    }
    result.paths = paths;
    result.pathsDir = dir;
  }
  return result;
}

function stripUndefined(chain: RawConfigChain): RawConfigChain {
  const out: RawConfigChain = {};
  if (chain.paths) {
    out.paths = chain.paths;
    if (chain.pathsDir) out.pathsDir = chain.pathsDir;
  }
  if (chain.baseUrl) out.baseUrl = chain.baseUrl;
  return out;
}

/** Project references (Vite templates keep `paths` in tsconfig.app.json). */
function referencedConfigs(file: string): string[] {
  const json = readJsoncFile(file);
  if (!Array.isArray(json.references)) return [];
  const dir = path.dirname(file);
  const files: string[] = [];
  for (const ref of json.references) {
    if (!isRecord(ref) || typeof ref.path !== "string") continue;
    const abs = path.resolve(dir, ref.path);
    if (fileExists(abs)) files.push(abs);
    else if (fileExists(path.join(abs, "tsconfig.json"))) files.push(path.join(abs, "tsconfig.json"));
  }
  // Prefer the app config over node/test configs.
  return files.sort((a, b) => Number(/node|test|spec/.test(path.basename(a))) - Number(/node|test|spec/.test(path.basename(b))));
}

/** Read `compilerOptions.paths` from tsconfig.json (or jsconfig.json), following `extends` and `references`. */
export function readTsConfig(cwd: string): TsConfigInfo | undefined {
  const file = ["tsconfig.json", "jsconfig.json"].map((name) => path.join(cwd, name)).find(fileExists);
  if (!file) return undefined;

  const candidates = [file, ...referencedConfigs(file)];
  for (const candidate of candidates) {
    const chain = loadConfigChain(candidate);
    if (chain.paths && Object.keys(chain.paths).length > 0) {
      return { file: candidate, pathsBase: chain.baseUrl ?? chain.pathsDir ?? path.dirname(candidate), paths: chain.paths };
    }
  }
  return { file, pathsBase: cwd, paths: {} };
}

/** The alias prefix used by the project (`@` for `"@/*"`), preferring `@` and `~`. */
export function detectAliasPrefix(tsconfig: TsConfigInfo | undefined): string | undefined {
  if (!tsconfig) return undefined;
  const keys = Object.keys(tsconfig.paths).filter((key) => key.endsWith("/*"));
  const preferred = ["@/*", "~/*", "#/*"].find((key) => keys.includes(key)) ?? keys[0];
  return preferred?.slice(0, -2);
}

export interface ResolvedAlias {
  /** Absolute filesystem path. */
  path: string;
  /** Whether a tsconfig `paths` entry matched (otherwise a best guess was used). */
  matched: boolean;
}

/**
 * Map an import alias (`@/components/ui`) to a directory using tsconfig paths.
 * Falls back to `src/<rest>` or `<rest>` when no paths entry matches.
 */
export function resolveAlias(alias: string, options: { cwd: string; tsconfig: TsConfigInfo | undefined; srcDir: boolean }): ResolvedAlias {
  const { cwd, tsconfig, srcDir } = options;
  if (alias.startsWith(".") || path.isAbsolute(alias)) return { path: path.resolve(cwd, alias), matched: true };

  let best: { prefixLength: number; target: string } | undefined;
  for (const [pattern, targets] of Object.entries(tsconfig?.paths ?? {})) {
    const first = targets[0];
    if (first === undefined) continue;
    if (pattern.endsWith("*")) {
      const prefix = pattern.slice(0, -1); // "@/"
      const bare = prefix.replace(/\/$/, ""); // "@"
      let rest: string | undefined;
      if (alias.startsWith(prefix)) rest = alias.slice(prefix.length);
      else if (alias === bare) rest = "";
      if (rest !== undefined && (!best || prefix.length > best.prefixLength)) {
        best = { prefixLength: prefix.length, target: first.replace("*", rest) };
      }
    } else if (alias === pattern || alias.startsWith(`${pattern}/`)) {
      if (!best || pattern.length > best.prefixLength) {
        best = { prefixLength: pattern.length, target: first + alias.slice(pattern.length) };
      }
    }
  }
  if (best && tsconfig) return { path: path.resolve(tsconfig.pathsBase, best.target.replace(/\/+$/, "")), matched: true };

  const rest = alias.replace(/^[@~#][^/]*\//, "").replace(/^[@~#]$/, "");
  return { path: path.resolve(cwd, srcDir ? "src" : ".", rest), matched: false };
}

/* -------------------------------------------------------------------------- */
/* CSS + project                                                              */
/* -------------------------------------------------------------------------- */

/** Find the global stylesheet, preferring one that already imports Tailwind. */
export function detectCssFile(cwd: string): string | undefined {
  const existing = CSS_CANDIDATES.filter((candidate) => fileExists(path.join(cwd, candidate)));
  const withTailwind = existing.find((candidate) => hasTailwindImport(readFileSync(path.join(cwd, candidate), "utf8")));
  return withTailwind ?? existing[0];
}

/** Inspect a project directory. Throws a `CliError` when there is no package.json. */
export function getProjectInfo(cwd: string): ProjectInfo {
  const packageJson = readPackageJson(cwd);
  if (!packageJson) {
    throw new CliError(`No package.json found in ${cwd}.`, {
      hint: "Run this command in the root of your React project, or pass --cwd <dir>.",
    });
  }
  const framework = detectFramework(packageJson);
  const srcDir = dirExists(path.join(cwd, "src"));
  const appDir = dirExists(path.join(cwd, "app")) || dirExists(path.join(cwd, "src", "app"));
  const tsconfig = readTsConfig(cwd);
  const cssFile = detectCssFile(cwd);
  const cssText = cssFile ? readTextIfExists(path.join(cwd, cssFile)) : undefined;

  return {
    cwd,
    packageJson,
    framework,
    srcDir,
    appDir,
    rsc: framework === "next" && appDir,
    tsconfig,
    aliasPrefix: detectAliasPrefix(tsconfig),
    cssFile: cssFile ? toPosixRelative(cwd, path.join(cwd, cssFile)) : undefined,
    cssHasTailwind: cssText !== undefined && hasTailwindImport(cssText),
    tailwindMajor: majorVersion(allDependencies(packageJson).tailwindcss),
  };
}
