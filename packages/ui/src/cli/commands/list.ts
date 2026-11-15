import path from "node:path";

import kleur from "kleur";

import { readConfig } from "../utils/config.ts";
import type { CommandContext } from "../utils/context.ts";
import { fetchRegistryIndex, groupByCategory, resolveRegistrySource, type RegistryIndexEntry } from "../utils/registry.ts";

export interface ListOptions {
  cwd: string;
  json?: boolean;
  registry?: string;
}

export interface ListResult {
  categories: Array<{ category: string; items: RegistryIndexEntry[] }>;
}

/** `materializedcss list`: components grouped by category. */
export async function runList(options: ListOptions, context: CommandContext): Promise<ListResult> {
  const { logger } = context;
  const cwd = path.resolve(options.cwd);
  let configured: string | undefined;
  try {
    configured = readConfig(cwd)?.registry;
  } catch {
    configured = undefined;
  }
  const source = resolveRegistrySource(options.registry ?? configured, cwd);
  const index = await fetchRegistryIndex(source);
  const categories = groupByCategory(index).map(([category, items]) => ({ category, items }));

  if (options.json) {
    const json = categories.flatMap(({ category, items }) =>
      items.map((item) => ({
        name: item.name,
        title: item.title,
        description: item.description,
        category,
        dependencies: item.dependencies ?? [],
        registryDependencies: item.registryDependencies ?? [],
      })),
    );
    logger.log(JSON.stringify(json, null, 2));
    return { categories };
  }

  const width = Math.max(0, ...categories.flatMap(({ items }) => items.map((item) => item.name.length))) + 2;
  for (const { category, items } of categories) {
    logger.log(kleur.bold().underline(category));
    for (const item of items) logger.log(`  ${kleur.cyan(item.name.padEnd(width))}${kleur.dim(item.description)}`);
    logger.log();
  }
  const total = categories.reduce((sum, group) => sum + group.items.length, 0);
  logger.log(`${total} components. Add one with ${kleur.cyan("npx materializedcss add <name>")}.`);
  return { categories };
}
