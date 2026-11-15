import path from "node:path";

import { readTextIfExists, writeText } from "./fs.ts";
import { CliError } from "./logger.ts";
import { resolveAlias, type ProjectInfo, type TsConfigInfo } from "./project.ts";

export const CONFIG_FILE = "materialized.json";
export const CONFIG_SCHEMA_URL = "https://muhibahmed.github.io/materializedcss/schema.json";

export interface ConfigAliases {
  components: string;
  ui: string;
  lib: string;
  hooks: string;
  utils: string;
}

/** Shape of `materialized.json` (mirrors shadcn's `components.json`). */
export interface MaterializedConfig {
  $schema?: string;
  style: "default";
  rsc: boolean;
  tsx: true;
  tailwind: {
    css: string;
    cssVariables: true;
  };
  aliases: ConfigAliases;
  /** Base URL of a remote registry (`<url>/<name>.json`). Defaults to the registry bundled with the CLI. */
  registry?: string;
}

/** Absolute directories (and the utils file, without extension) that the aliases point to. */
export interface ResolvedPaths {
  cwd: string;
  components: string;
  ui: string;
  lib: string;
  hooks: string;
  utils: string;
  css: string;
  /** Aliases that matched no tsconfig `paths` entry (imports may not resolve). */
  unmatched: string[];
}

export function defaultAliases(prefix = "@"): ConfigAliases {
  return {
    components: `${prefix}/components`,
    ui: `${prefix}/components/ui`,
    lib: `${prefix}/lib`,
    hooks: `${prefix}/hooks`,
    utils: `${prefix}/lib/utils`,
  };
}

export function createConfig(input: { rsc: boolean; css: string; aliases: ConfigAliases; registry?: string | undefined }): MaterializedConfig {
  return {
    $schema: CONFIG_SCHEMA_URL,
    style: "default",
    rsc: input.rsc,
    tsx: true,
    tailwind: { css: input.css, cssVariables: true },
    aliases: input.aliases,
    ...(input.registry ? { registry: input.registry } : {}),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validate parsed JSON as a config, returning an error message on failure. */
export function parseConfig(input: unknown): { ok: true; value: MaterializedConfig } | { ok: false; error: string } {
  if (!isRecord(input)) return { ok: false, error: "expected a JSON object" };
  const { rsc, tailwind, aliases, registry } = input;
  if (rsc !== undefined && typeof rsc !== "boolean") return { ok: false, error: '"rsc" must be a boolean' };
  if (!isRecord(tailwind) || typeof tailwind.css !== "string") return { ok: false, error: '"tailwind.css" must be a string' };
  if (!isRecord(aliases)) return { ok: false, error: '"aliases" must be an object' };
  if (registry !== undefined && typeof registry !== "string") return { ok: false, error: '"registry" must be a string' };

  const defaults = defaultAliases();
  const resolved = { ...defaults };
  for (const key of Object.keys(defaults) as Array<keyof ConfigAliases>) {
    const value = aliases[key];
    if (value === undefined) continue;
    if (typeof value !== "string" || value.trim() === "") return { ok: false, error: `"aliases.${key}" must be a non-empty string` };
    resolved[key] = value.replace(/\/+$/, "");
  }
  // Derive the optional aliases from `components` / `lib` when omitted, like shadcn.
  if (aliases.ui === undefined) resolved.ui = `${resolved.components}/ui`;
  if (aliases.utils === undefined) resolved.utils = `${resolved.lib}/utils`;

  return {
    ok: true,
    value: createConfig({ rsc: rsc ?? false, css: tailwind.css, aliases: resolved, registry }),
  };
}

export function configPath(cwd: string): string {
  return path.join(cwd, CONFIG_FILE);
}

/** Read `materialized.json`, or `undefined` when the project is not initialised. */
export function readConfig(cwd: string): MaterializedConfig | undefined {
  const file = configPath(cwd);
  const text = readTextIfExists(file);
  if (text === undefined) return undefined;
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new CliError(`${CONFIG_FILE} is not valid JSON: ${(error as Error).message}`, {
      hint: `Fix it by hand or re-create it with "materializedcss init".`,
    });
  }
  const result = parseConfig(json);
  if (!result.ok) {
    throw new CliError(`Invalid ${CONFIG_FILE}: ${result.error}.`, { hint: `Re-create it with "materializedcss init".` });
  }
  return result.value;
}

export function writeConfig(cwd: string, config: MaterializedConfig): void {
  writeText(configPath(cwd), `${JSON.stringify(config, null, 2)}\n`);
}

/** Resolve every alias to an absolute path through the project's tsconfig paths. */
export function resolveConfigPaths(
  cwd: string,
  config: MaterializedConfig,
  project: { tsconfig: TsConfigInfo | undefined; srcDir: boolean } | ProjectInfo,
): ResolvedPaths {
  const unmatched: string[] = [];
  const resolve = (alias: string): string => {
    const result = resolveAlias(alias, { cwd, tsconfig: project.tsconfig, srcDir: project.srcDir });
    if (!result.matched) unmatched.push(alias);
    return result.path;
  };
  return {
    cwd,
    components: resolve(config.aliases.components),
    ui: resolve(config.aliases.ui),
    lib: resolve(config.aliases.lib),
    hooks: resolve(config.aliases.hooks),
    utils: resolve(config.aliases.utils),
    css: path.resolve(cwd, config.tailwind.css),
    unmatched,
  };
}
