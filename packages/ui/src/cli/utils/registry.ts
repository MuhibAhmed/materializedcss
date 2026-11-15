import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { fileExists } from "./fs.ts";
import { CliError } from "./logger.ts";
import { registryItemMetaSchema, type RegistryItem, type RegistryItemMeta } from "./registry-schema.ts";

/** Where registry items come from: a directory on disk (the bundled registry) or a URL. */
export type RegistrySource = { kind: "dir"; dir: string } | { kind: "url"; url: string };

/** An index entry: item metadata without file contents. */
export type RegistryIndexEntry = RegistryItemMeta;

/**
 * Locate a file shipped next to the CLI. The bundled CLI lives in `dist/cli/index.js`
 * (so `../registry`); when running from source (`src/cli/utils/*.ts`) we fall back to `dist/`.
 */
function findShipped(relativeCandidates: readonly string[], test: (abs: string) => boolean): string | undefined {
  const here = path.dirname(fileURLToPath(import.meta.url));
  for (const candidate of relativeCandidates) {
    const abs = path.resolve(here, candidate);
    if (test(abs)) return abs;
  }
  return undefined;
}

/** The registry bundled with the package (`dist/registry`). */
export function getBundledRegistryDir(): string {
  const dir = findShipped(["../registry", "../../registry", "../../../dist/registry", "../../dist/registry"], (abs) =>
    fileExists(path.join(abs, "index.json")),
  );
  if (!dir) {
    throw new CliError("The bundled component registry is missing.", {
      hint: "Reinstall materializedcss, or pass --registry <url>. (Developing locally? Run `npm run build -w materializedcss`.)",
    });
  }
  return dir;
}

/** The Tailwind theme stylesheet shipped with the package (`dist/theme.css`). */
export function getBundledThemeFile(): string {
  const file = findShipped(["../theme.css", "../../theme.css", "../../../dist/theme.css", "../styles/theme.css", "../../styles/theme.css"], fileExists);
  if (!file) throw new CliError("The bundled theme.css is missing.", { hint: "Reinstall materializedcss." });
  return file;
}

/** `--registry` / config `registry`: a URL or a local directory. Defaults to the bundled registry. */
export function resolveRegistrySource(registry: string | undefined, cwd: string): RegistrySource {
  if (!registry) return { kind: "dir", dir: getBundledRegistryDir() };
  if (/^https?:\/\//i.test(registry)) return { kind: "url", url: registry.replace(/\/+$/, "") };
  return { kind: "dir", dir: path.resolve(cwd, registry) };
}

function describe(source: RegistrySource): string {
  return source.kind === "url" ? source.url : source.dir;
}

async function readJson(source: RegistrySource, file: string): Promise<unknown | undefined> {
  if (source.kind === "dir") {
    const abs = path.join(source.dir, file);
    if (!fileExists(abs)) return undefined;
    return JSON.parse(readFileSync(abs, "utf8")) as unknown;
  }
  const url = `${source.url}/${file}`;
  let response: Response;
  try {
    response = await fetch(url, { headers: { accept: "application/json" } });
  } catch (error) {
    throw new CliError(`Could not reach the registry at ${url}: ${(error as Error).message}`, {
      hint: "Check your network connection or the --registry URL.",
    });
  }
  if (response.status === 404) return undefined;
  if (!response.ok) throw new CliError(`The registry returned ${response.status} ${response.statusText} for ${url}.`);
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new CliError(`The registry returned invalid JSON for ${url}.`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Accept both our own item format and shadcn registry items (as published under `/r`):
 * strips the `registry/materializedcss/` path prefix, maps `categories` to `category`,
 * and URL registryDependencies (`https://…/r/utils.json`) back to names.
 */
export function normalizeRegistryItem(input: unknown): unknown {
  if (!isRecord(input)) return input;
  const item: Record<string, unknown> = { ...input };
  if (item.category === undefined && Array.isArray(item.categories) && typeof item.categories[0] === "string") {
    const raw = item.categories[0];
    item.category = raw.replace(/(^|\s)\w/g, (c) => c.toUpperCase());
  }
  if (Array.isArray(item.registryDependencies)) {
    item.registryDependencies = item.registryDependencies.map((dep: unknown) =>
      typeof dep === "string" && /[/:]/.test(dep) ? (dep.split("/").pop() ?? dep).replace(/\.json$/, "") : dep,
    );
  }
  if (Array.isArray(item.files)) {
    item.files = item.files.map((file: unknown) =>
      isRecord(file) && typeof file.path === "string"
        ? { ...file, path: file.path.replace(/^registry\/[^/]+\//, "") }
        : file,
    );
  }
  const { $schema: _schema, categories: _categories, ...rest } = item;
  return rest;
}

/** Validate a full registry item (meta + file contents). */
export function parseRegistryItem(input: unknown, name: string): RegistryItem {
  const normalized = normalizeRegistryItem(input);
  const meta = registryItemMetaSchema(normalized);
  if (!meta.ok) throw new CliError(`Registry item "${name}" is invalid: ${meta.error}.`);
  const files = (normalized as { files: unknown[] }).files;
  return {
    ...meta.value,
    files: meta.value.files.map((file, index) => {
      const raw = files[index];
      const content = isRecord(raw) ? raw.content : undefined;
      if (typeof content !== "string") throw new CliError(`Registry item "${name}" has no content for ${file.path}.`);
      return { ...file, content };
    }),
  };
}

/** List every item in the registry (`index.json`, or a shadcn `registry.json`). */
export async function fetchRegistryIndex(source: RegistrySource): Promise<RegistryIndexEntry[]> {
  let raw = await readJson(source, "index.json");
  if (raw === undefined) {
    const shadcn = await readJson(source, "registry.json");
    raw = isRecord(shadcn) ? shadcn.items : undefined;
  }
  if (!Array.isArray(raw)) {
    throw new CliError(`No registry index found at ${describe(source)} (expected index.json or registry.json).`);
  }
  return raw.map((entry: unknown, index) => {
    const result = registryItemMetaSchema(normalizeRegistryItem(entry));
    if (!result.ok) throw new CliError(`Registry index entry #${index} is invalid: ${result.error}.`);
    return result.value;
  });
}

/** Fetch one item with its file contents. */
export async function fetchRegistryItem(source: RegistrySource, name: string): Promise<RegistryItem> {
  if (!/^[a-z0-9-]+$/.test(name)) throw new CliError(`"${name}" is not a valid component name.`);
  const raw = await readJson(source, `${name}.json`);
  if (raw === undefined) {
    throw new CliError(`Component "${name}" was not found in the registry (${describe(source)}).`, {
      hint: 'Run "materializedcss list" to see the available components.',
    });
  }
  return parseRegistryItem(raw, name);
}

/**
 * Resolve `names` and their `registryDependencies` recursively. The result is in
 * dependency order (dependencies before dependents) without duplicates.
 */
export async function resolveRegistryTree(
  names: readonly string[],
  getItem: (name: string) => Promise<RegistryItem>,
): Promise<RegistryItem[]> {
  const ordered: RegistryItem[] = [];
  const done = new Set<string>();
  const visiting: string[] = [];
  const cache = new Map<string, Promise<RegistryItem>>();
  const load = (name: string): Promise<RegistryItem> => {
    let pending = cache.get(name);
    if (!pending) {
      pending = getItem(name);
      cache.set(name, pending);
    }
    return pending;
  };

  const visit = async (name: string): Promise<void> => {
    if (done.has(name)) return;
    if (visiting.includes(name)) {
      throw new CliError(`Circular registry dependency: ${[...visiting, name].join(" → ")}.`);
    }
    visiting.push(name);
    const item = await load(name);
    for (const dep of item.registryDependencies ?? []) await visit(dep);
    visiting.pop();
    done.add(name);
    ordered.push(item);
  };

  for (const name of names) await visit(name);
  return ordered;
}

/** Suggest close matches for a mistyped component name. */
export function suggestNames(name: string, available: readonly string[]): string[] {
  return available
    .map((candidate) => ({ candidate, score: levenshtein(name, candidate) }))
    .filter(({ candidate, score }) => score <= Math.max(2, Math.floor(name.length / 3)) || candidate.includes(name))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}

function levenshtein(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min((previous[j] ?? 0) + 1, (current[j - 1] ?? 0) + 1, (previous[j - 1] ?? 0) + cost);
    }
    previous = current;
  }
  return previous[b.length] ?? 0;
}

/** Docs sidebar order of categories. Unknown categories sort last, alphabetically. */
export const CATEGORY_ORDER: readonly string[] = [
  "Foundations",
  "Actions",
  "Forms",
  "Data Display",
  "Navigation",
  "Overlays",
  "Feedback",
  "Layout",
  "Media & Motion",
];

/** Group items that have a category, in docs order. */
export function groupByCategory<T extends { category?: string; name: string }>(items: readonly T[]): Array<[string, T[]]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    if (!item.category) continue;
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }
  const rank = (category: string): number => {
    const index = CATEGORY_ORDER.indexOf(category);
    return index === -1 ? CATEGORY_ORDER.length : index;
  };
  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([category, list]) => [category, list.sort((a, b) => a.name.localeCompare(b.name))]);
}

/** Version of the installed materializedcss package (the CLI's own package.json). */
export function getCliVersion(): string {
  const file = findShipped(["../../package.json", "../../../package.json"], (abs) => {
    if (!fileExists(abs)) return false;
    try {
      return (JSON.parse(readFileSync(abs, "utf8")) as { name?: unknown }).name === "materializedcss";
    } catch {
      return false;
    }
  });
  if (!file) return "0.0.0";
  const pkg = JSON.parse(readFileSync(file, "utf8")) as { version?: unknown };
  return typeof pkg.version === "string" ? pkg.version : "0.0.0";
}
