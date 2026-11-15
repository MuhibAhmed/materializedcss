import path from "node:path";

import kleur from "kleur";

import { CONFIG_FILE, readConfig, resolveConfigPaths } from "../utils/config.ts";
import type { CommandContext } from "../utils/context.ts";
import { createUnifiedDiff } from "../utils/diff.ts";
import { readTextIfExists, toPosixRelative } from "../utils/fs.ts";
import { CliError } from "../utils/logger.ts";
import { getProjectInfo } from "../utils/project.ts";
import { fetchRegistryIndex, fetchRegistryItem, resolveRegistrySource, suggestNames } from "../utils/registry.ts";
import { resolveFileTarget } from "../utils/targets.ts";
import { transformSource } from "../utils/transform.ts";

export interface DiffOptions {
  cwd: string;
  component?: string;
  registry?: string;
  /** Directory used with `add --path`. */
  path?: string;
}

export interface FileDiff {
  item: string;
  target: string;
  local: string;
  /** Registry content after alias rewriting. */
  remote: string;
  /** Unified diff from the local file to the registry version (uncolored). */
  patch: string;
}

export interface DiffResult {
  /** Components with at least one local file that differs from the registry. */
  changed: string[];
  diffs: FileDiff[];
}

const colors = { added: kleur.green, removed: kleur.red, header: kleur.cyan };

/** `materializedcss diff [component]`: compare local copies with the registry. */
export async function runDiff(options: DiffOptions, context: CommandContext): Promise<DiffResult> {
  const { logger } = context;
  const cwd = path.resolve(options.cwd);
  const config = readConfig(cwd);
  if (!config) throw new CliError(`${CONFIG_FILE} not found in ${cwd}.`, { hint: 'Run "npx materializedcss init" first.' });
  const project = getProjectInfo(cwd);
  const paths = resolveConfigPaths(cwd, config, project);
  const source = resolveRegistrySource(options.registry ?? config.registry, cwd);
  const index = await fetchRegistryIndex(source);
  const uiDir = options.path ? path.resolve(cwd, options.path) : undefined;

  let names: string[];
  if (options.component) {
    if (!index.some((item) => item.name === options.component)) {
      const suggestions = suggestNames(options.component, index.map((item) => item.name));
      throw new CliError(`Unknown component: ${options.component}.`, {
        hint: suggestions.length ? `Did you mean ${suggestions.join(", ")}?` : 'Run "materializedcss list".',
      });
    }
    names = [options.component];
  } else {
    names = index.map((item) => item.name);
  }

  const diffs: FileDiff[] = [];
  const installed = new Set<string>();
  for (const name of names) {
    const item = await fetchRegistryItem(source, name);
    for (const file of item.files) {
      const target = resolveFileTarget(file, paths, uiDir);
      if (!target) continue;
      const local = readTextIfExists(target);
      if (local === undefined) continue;
      installed.add(name);
      const remote = transformSource(file.content, { aliases: config.aliases, rsc: config.rsc });
      const rel = toPosixRelative(cwd, target);
      const patch = createUnifiedDiff(local, remote, { oldLabel: `${rel} (local)`, newLabel: `${rel} (registry)` });
      if (patch) diffs.push({ item: name, target, local, remote, patch });
    }
  }
  const changed = [...new Set(diffs.map((diff) => diff.item))];

  if (options.component) {
    if (!installed.has(options.component)) {
      logger.warn(`${options.component} is not installed in this project. Add it with "materializedcss add ${options.component}".`);
    } else if (diffs.length === 0) {
      logger.success(`${options.component} is up to date with the registry.`);
    } else {
      for (const diff of diffs) {
        const rel = toPosixRelative(cwd, diff.target);
        logger.log(createUnifiedDiff(diff.local, diff.remote, { oldLabel: `${rel} (local)`, newLabel: `${rel} (registry)`, color: colors }));
        logger.log();
      }
      logger.info(`Update with ${kleur.cyan(`npx materializedcss add ${options.component} --overwrite`)}.`);
    }
  } else if (changed.length === 0) {
    logger.success(installed.size ? "All installed components match the registry." : "No registry components found in this project.");
  } else {
    logger.log(kleur.bold("Components that differ from the registry:"));
    for (const name of changed) {
      logger.log(`  ${kleur.cyan(name)}`);
      for (const diff of diffs.filter((entry) => entry.item === name)) logger.log(kleur.dim(`    ${toPosixRelative(cwd, diff.target)}`));
    }
    logger.log();
    logger.info(`See the changes with ${kleur.cyan("npx materializedcss diff <component>")}.`);
  }

  return { changed, diffs };
}
