import path from "node:path";

import kleur from "kleur";

import { CONFIG_FILE, readConfig, resolveConfigPaths, type MaterializedConfig } from "../utils/config.ts";
import { getInstaller, type CommandContext } from "../utils/context.ts";
import { toPosixRelative } from "../utils/fs.ts";
import { CliError } from "../utils/logger.ts";
import { assertSafePackageSpecs, detectPackageManager, getInstallCommand, missingDependencies } from "../utils/package-manager.ts";
import { getProjectInfo } from "../utils/project.ts";
import {
  fetchRegistryIndex,
  fetchRegistryItem,
  groupByCategory,
  resolveRegistrySource,
  resolveRegistryTree,
  suggestNames,
  type RegistryIndexEntry,
} from "../utils/registry.ts";
import { resolveFileTarget } from "../utils/targets.ts";
import { transformSource } from "../utils/transform.ts";
import { writeFiles, type FileResult, type PlannedFile } from "../utils/write-files.ts";
import { runInit } from "./init.ts";

export interface AddOptions {
  cwd: string;
  components?: string[];
  all?: boolean;
  yes?: boolean;
  overwrite?: boolean;
  /** Directory for UI components instead of the `ui` alias (relative to cwd). */
  path?: string;
  skipInstall?: boolean;
  dryRun?: boolean;
  /** Registry URL or directory; overrides the config. */
  registry?: string;
}

export interface AddResult {
  /** Every registry item that was processed, in dependency order. */
  items: string[];
  files: FileResult[];
  dependencies: string[];
  installed: boolean;
}

/** Load the config, offering to run `init` when it is missing. */
async function ensureConfig(options: AddOptions, context: CommandContext): Promise<MaterializedConfig> {
  const cwd = path.resolve(options.cwd);
  const config = readConfig(cwd);
  if (config) return config;

  const hint = `Run ${kleur.cyan("npx materializedcss init")} first.`;
  if (options.dryRun) throw new CliError(`${CONFIG_FILE} not found in ${cwd}.`, { hint });
  const run = options.yes ? true : await context.prompter.confirm(`${CONFIG_FILE} not found. Run "materializedcss init" now?`, true);
  if (!run) throw new CliError(`${CONFIG_FILE} not found in ${cwd}.`, { hint });
  const result = await runInit(
    { cwd, yes: options.yes ?? false, skipInstall: options.skipInstall ?? false, ...(options.registry ? { registry: options.registry } : {}) },
    context,
  );
  context.logger.log();
  return result.config;
}

/** Decide which components to add: arguments, --all, or an interactive picker. */
async function selectComponents(options: AddOptions, index: readonly RegistryIndexEntry[], context: CommandContext): Promise<string[]> {
  const known = new Set(index.map((item) => item.name));
  if (options.all) return index.filter((item) => item.category).map((item) => item.name);

  const requested = options.components ?? [];
  if (requested.length > 0) {
    const unknown = requested.filter((name) => !known.has(name));
    if (unknown.length > 0) {
      const suggestions = unknown.flatMap((name) => suggestNames(name, [...known]));
      throw new CliError(`Unknown component${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}.`, {
        hint: suggestions.length
          ? `Did you mean ${[...new Set(suggestions)].join(", ")}? Run "materializedcss list" to see everything.`
          : 'Run "materializedcss list" to see the available components.',
      });
    }
    return [...new Set(requested)];
  }

  if (options.yes) {
    throw new CliError("No components given.", { hint: 'Pass component names (e.g. "add button card") or --all.' });
  }
  const choices = groupByCategory(index).flatMap(([category, items]) =>
    items.map((item) => ({ title: `${item.title} ${kleur.dim(`(${category})`)}`, value: item.name, description: item.description })),
  );
  const picked = await context.prompter.multiselect("Which components would you like to add?", choices);
  if (picked.length === 0) throw new CliError("No components selected.", { exitCode: 1 });
  return picked;
}

/** `materializedcss add`: copy components (and their dependencies) into the project. */
export async function runAdd(options: AddOptions, context: CommandContext): Promise<AddResult> {
  const { logger } = context;
  const cwd = path.resolve(options.cwd);
  const config = await ensureConfig(options, context);
  const project = getProjectInfo(cwd);
  const paths = resolveConfigPaths(cwd, config, project);
  const source = resolveRegistrySource(options.registry ?? config.registry, cwd);

  const index = await fetchRegistryIndex(source);
  const names = await selectComponents(options, index, context);
  const items = await resolveRegistryTree(names, (name) => fetchRegistryItem(source, name));

  const uiDir = options.path ? path.resolve(cwd, options.path) : undefined;
  const planned: PlannedFile[] = items.flatMap((item) =>
    item.files.flatMap((file) => {
      const target = resolveFileTarget(file, paths, uiDir);
      return target ? [{ item: item.name, target, content: transformSource(file.content, { aliases: config.aliases, rsc: config.rsc }) }] : [];
    }),
  );

  const files = await writeFiles(planned, {
    cwd,
    overwrite: options.overwrite ?? false,
    yes: options.yes ?? false,
    dryRun: options.dryRun ?? false,
    prompter: context.prompter,
  });

  const wanted = items.flatMap((item) => item.dependencies ?? []);
  assertSafePackageSpecs(wanted);
  const dependencies = missingDependencies(project.packageJson, wanted);
  const manager = detectPackageManager(cwd, context.userAgent);
  let installed = false;

  printSummary(files, cwd, options.dryRun ?? false, context);

  if (dependencies.length > 0) {
    const { command, args } = getInstallCommand(manager, dependencies);
    const commandLine = `${command} ${args.join(" ")}`;
    if (options.dryRun) logger.info(`Would install: ${kleur.cyan(dependencies.join(" "))}`);
    else if (options.skipInstall) logger.info(`Skipped installing dependencies. Run: ${kleur.cyan(commandLine)}`);
    else {
      logger.info(`Installing ${dependencies.join(", ")} with ${manager}...`);
      await getInstaller(context)(cwd, manager, dependencies);
      installed = true;
      logger.success("Installed dependencies.");
    }
  }

  return { items: items.map((item) => item.name), files, dependencies, installed };
}

function printSummary(files: readonly FileResult[], cwd: string, dryRun: boolean, context: CommandContext): void {
  const { logger } = context;
  const groups: Array<[FileResult["status"], string, (s: string) => string]> = [
    ["created", dryRun ? "Would create" : "Created", kleur.green],
    ["updated", dryRun ? "Would update" : "Updated", kleur.yellow],
    ["unchanged", "Unchanged", kleur.dim],
    ["skipped", "Skipped (exists and differs; use --overwrite)", kleur.yellow],
  ];
  if (dryRun) logger.info(kleur.bold("Dry run: nothing was written."));
  for (const [status, label, paint] of groups) {
    const list = files.filter((file) => file.status === status);
    if (list.length === 0) continue;
    logger.log(paint(`${label} (${list.length}):`));
    for (const file of list) logger.log(`  ${toPosixRelative(cwd, file.target)}`);
  }
  const skipped = files.filter((file) => file.status === "skipped");
  if (skipped.length > 0 && !dryRun) {
    logger.warn(`${skipped.length} file${skipped.length > 1 ? "s were" : " was"} not overwritten. Run "materializedcss diff" to compare.`);
  }
  if (files.length === 0) logger.info("Nothing to write.");
}
