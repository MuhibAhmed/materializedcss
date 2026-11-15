import path from "node:path";

import { Command, Option } from "commander";
import kleur from "kleur";

import { runAdd } from "./commands/add.ts";
import { runDiff } from "./commands/diff.ts";
import { runInit } from "./commands/init.ts";
import { runList } from "./commands/list.ts";
import type { CommandContext } from "./utils/context.ts";
import { CliError, createLogger } from "./utils/logger.ts";
import { defaultPrompter } from "./utils/prompt.ts";
import { getCliVersion } from "./utils/registry.ts";

interface GlobalCwdOptions {
  cwd: string;
}

function createContext(): CommandContext {
  return { logger: createLogger(), prompter: defaultPrompter(), userAgent: process.env.npm_config_user_agent };
}

function cwdOption(): Option {
  return new Option("-c, --cwd <dir>", "the project directory").default(process.cwd(), "current directory");
}

function registryOption(): Option {
  return new Option("--registry <url>", "registry base URL (or directory) to read components from");
}

/** Build the commander program. Exported for tests. */
export function createProgram(context: () => CommandContext = createContext): Command {
  const program = new Command()
    .name("materializedcss")
    .description("Add Materialize (Material Design) components for React 19 + Tailwind CSS v4 to your project.")
    .version(getCliVersion(), "-v, --version", "print the version")
    .helpOption("-h, --help", "show help")
    .showHelpAfterError("(run with --help for usage)")
    .configureOutput({ outputError: (text, write) => write(kleur.red(text)) });

  program
    .command("init")
    .description("configure your project: materialized.json, lib/utils.ts, the theme import and base dependencies")
    .option("-y, --yes", "skip prompts and confirmations (continue even without Tailwind CSS v4)")
    .option("-d, --defaults", "use the default configuration without prompting")
    .addOption(cwdOption())
    .option("--css <path>", "path to your global CSS file")
    .option("--copy-theme", "copy theme.css into your project instead of importing it from the package")
    .option("--rsc", "mark components as React Server Components-ready (keep \"use client\")")
    .option("--no-rsc", "strip \"use client\" directives (not using React Server Components)")
    .option("--skip-install", "do not install dependencies")
    .option("-f, --force", "replace an existing lib/utils.ts that differs")
    .addOption(registryOption())
    .action(async (opts: GlobalCwdOptions & {
      yes?: boolean;
      defaults?: boolean;
      css?: string;
      copyTheme?: boolean;
      rsc?: boolean;
      skipInstall?: boolean;
      force?: boolean;
      registry?: string;
    }) => {
      await runInit(
        {
          cwd: path.resolve(opts.cwd),
          yes: opts.yes,
          defaults: opts.defaults,
          copyTheme: opts.copyTheme,
          skipInstall: opts.skipInstall,
          force: opts.force,
          ...(opts.css !== undefined ? { css: opts.css } : {}),
          ...(opts.rsc !== undefined ? { rsc: opts.rsc } : {}),
          ...(opts.registry !== undefined ? { registry: opts.registry } : {}),
        },
        context(),
      );
    });

  program
    .command("add")
    .description("copy components and their dependencies into your project")
    .argument("[components...]", "component names, e.g. button card")
    .option("-a, --all", "add every component")
    .option("-y, --yes", "skip prompts; existing files that differ are kept")
    .option("-o, --overwrite", "overwrite existing files that differ")
    .addOption(cwdOption())
    .option("-p, --path <dir>", "put UI components in this directory instead of the ui alias")
    .option("--skip-install", "do not install npm dependencies")
    .option("--dry-run", "show what would be written without changing anything")
    .addOption(registryOption())
    .action(async (components: string[], opts: GlobalCwdOptions & {
      all?: boolean;
      yes?: boolean;
      overwrite?: boolean;
      path?: string;
      skipInstall?: boolean;
      dryRun?: boolean;
      registry?: string;
    }) => {
      await runAdd(
        {
          cwd: path.resolve(opts.cwd),
          components,
          all: opts.all,
          yes: opts.yes,
          overwrite: opts.overwrite,
          skipInstall: opts.skipInstall,
          dryRun: opts.dryRun,
          ...(opts.path !== undefined ? { path: opts.path } : {}),
          ...(opts.registry !== undefined ? { registry: opts.registry } : {}),
        },
        context(),
      );
    });

  program
    .command("list")
    .alias("ls")
    .description("list the available components by category")
    .option("--json", "print JSON")
    .addOption(cwdOption())
    .addOption(registryOption())
    .action(async (opts: GlobalCwdOptions & { json?: boolean; registry?: string }) => {
      await runList(
        { cwd: path.resolve(opts.cwd), json: opts.json, ...(opts.registry !== undefined ? { registry: opts.registry } : {}) },
        context(),
      );
    });

  program
    .command("diff")
    .description("compare your copies with the registry (no argument: list components that differ)")
    .argument("[component]", "component to show a line diff for")
    .addOption(cwdOption())
    .option("-p, --path <dir>", "directory used with add --path")
    .addOption(registryOption())
    .action(async (component: string | undefined, opts: GlobalCwdOptions & { path?: string; registry?: string }) => {
      await runDiff(
        {
          cwd: path.resolve(opts.cwd),
          ...(component !== undefined ? { component } : {}),
          ...(opts.path !== undefined ? { path: opts.path } : {}),
          ...(opts.registry !== undefined ? { registry: opts.registry } : {}),
        },
        context(),
      );
    });

  return program;
}

/** Print an error and return the exit code. */
export function reportError(error: unknown, logger = createLogger()): number {
  if (error instanceof CliError) {
    logger.error(error.message);
    if (error.hint) logger.log(error.hint);
    return error.exitCode;
  }
  logger.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  logger.log("This looks like a bug in materializedcss. Please report it with the output above.");
  return 1;
}

async function main(argv: readonly string[]): Promise<void> {
  try {
    await createProgram().parseAsync([...argv]);
  } catch (error) {
    process.exitCode = reportError(error);
  }
}

await main(process.argv);
