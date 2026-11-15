import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";

import { CATEGORY_ORDER, type NavItem, type NavSection } from "~/lib/site";

export interface RegistryMeta {
  name: string;
  type: string;
  title: string;
  description: string;
  category?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: Array<{ path: string; type: string }>;
  improvements?: string[];
}

export const UI_ROOT: string = path.resolve(process.cwd(), "../../packages/ui");

/** All registry meta files from packages/ui/registry. */
export const getRegistry: () => RegistryMeta[] = cache((): RegistryMeta[] => {
  const dir = path.join(UI_ROOT, "registry");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(readFileSync(path.join(dir, file), "utf8")) as RegistryMeta);
});

export function getRegistryItem(name: string): RegistryMeta | undefined {
  return getRegistry().find((item) => item.name === name);
}

/** Read a source file from packages/ui/src. */
export function readUiSource(relativePath: string): string {
  return readFileSync(path.join(UI_ROOT, "src", relativePath), "utf8").replace(/\r\n/g, "\n");
}

/** Read a docs example from registry/examples. */
export function readExampleSource(name: string): string {
  return readFileSync(path.join(process.cwd(), "registry", "examples", `${name}.tsx`), "utf8").replace(/\r\n/g, "\n");
}

/** Whether `app/docs/components/<name>/page.tsx` exists. */
function hasDocsPage(name: string): boolean {
  return existsSync(path.join(process.cwd(), "app", "docs", "components", name, "page.tsx"));
}

/** Sidebar sections for documented components, grouped by registry category. */
export const getComponentNav: () => NavSection[] = cache((): NavSection[] => {
  const groups = new Map<string, NavItem[]>();
  for (const item of getRegistry()) {
    // Categorized items without a docs page (e.g. icons) would be dead links.
    if (!item.category || !hasDocsPage(item.name)) continue;
    const list = groups.get(item.category) ?? [];
    list.push({ title: item.title, href: `/docs/components/${item.name}` });
    groups.set(item.category, list);
  }
  const rank = (category: string): number => {
    const index = CATEGORY_ORDER.indexOf(category);
    return index === -1 ? CATEGORY_ORDER.length : index;
  };
  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([title, items]) => ({ title, items: items.sort((a, b) => a.title.localeCompare(b.title)) }));
});
