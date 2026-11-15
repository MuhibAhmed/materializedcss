import path from "node:path";

import kleur from "kleur";

import {
  CONFIG_FILE,
  createConfig,
  defaultAliases,
  readConfig,
  resolveConfigPaths,
  writeConfig,
  type ConfigAliases,
  type MaterializedConfig,
} from "../utils/config.ts";
import { getInstaller, type CommandContext } from "../utils/context.ts";
import {
  addCssImport,
  COPIED_THEME_FILE,
  createStylesheet,
  hasTailwindImport,
  hasTailwindV3Directives,
  removeCssImport,
  THEME_PACKAGE_IMPORT,
} from "../utils/css.ts";
import { readTextIfExists, toImportSpecifier, toPosixRelative, writeText } from "../utils/fs.ts";
import { CliError } from "../utils/logger.ts";
import { detectPackageManager, getInstallCommand, missingDependencies } from "../utils/package-manager.ts";
import { FRAMEWORK_NAMES, getProjectInfo, type Framework, type ProjectInfo } from "../utils/project.ts";
import { fetchRegistryItem, getBundledThemeFile, getCliVersion, resolveRegistrySource } from "../utils/registry.ts";
import { resolveFileTarget } from "../utils/targets.ts";
import { transformSource } from "../utils/transform.ts";
import { writeFiles, type FileResult } from "../utils/write-files.ts";

export interface InitOptions {
  cwd: string;
  /** Skip all prompts and confirmations (and continue without Tailwind v4). */
  yes?: boolean;
  /** Use the default answers instead of prompting. */
  defaults?: boolean;
  /** Global stylesheet path, relative to cwd. */
  css?: string;
  /** Copy theme.css into the project instead of importing it from the package. */
  copyTheme?: boolean;
  /** Override React Server Components detection. */
  rsc?: boolean;
  skipInstall?: boolean;
  /** Remote registry URL saved to the config. */
  registry?: string;
  /** Replace an existing, different lib/utils.ts. */
  force?: boolean;
}

export interface InitResult {
  config: MaterializedConfig;
  configFile: string;
  cssFile: string;
  /** Theme stylesheet written with --copy-theme. */
  themeFile: string | undefined;
  files: FileResult[];
  /** Packages that were (or, with --skip-install, would be) installed. */
  dependencies: string[];
  installed: boolean;
}

/** Base packages every component relies on (cn() and variants). */
export const BASE_DEPENDENCIES: readonly string[] = ["clsx", "tailwind-merge", "class-variance-authority"];

export function defaultCssFile(project: Pick<ProjectInfo, "framework" | "srcDir" | "appDir" | "cwd">): string {
  switch (project.framework) {
    case "next":
      return project.srcDir ? "src/app/globals.css" : "app/globals.css";
    case "react-router":
      return "app/app.css";
    case "astro":
      return "src/styles/global.css";
    case "vite":
      return "src/index.css";
    case "other":
      return project.srcDir ? "src/index.css" : "styles/globals.css";
  }
}

/** Framework-specific steps to set up Tailwind CSS v4. */
export function tailwindInstructions(framework: Framework, cssFile: string, hasV3: boolean): string {
  const lines: string[] = [];
  if (hasV3) {
    lines.push("Your project uses Tailwind CSS v3. materializedcss needs Tailwind CSS v4:", "  npx @tailwindcss/upgrade", "");
  }
  if (framework === "next") {
    lines.push(
      "Set up Tailwind CSS v4 for Next.js:",
      "  1. npm install tailwindcss @tailwindcss/postcss postcss",
      '  2. postcss.config.mjs: export default { plugins: { "@tailwindcss/postcss": {} } };',
    );
  } else if (framework === "vite" || framework === "react-router" || framework === "astro") {
    lines.push(
      `Set up Tailwind CSS v4 for ${FRAMEWORK_NAMES[framework]}:`,
      "  1. npm install tailwindcss @tailwindcss/vite",
      framework === "astro"
        ? '  2. astro.config.mjs: import tailwindcss from "@tailwindcss/vite"; export default defineConfig({ vite: { plugins: [tailwindcss()] } });'
        : '  2. vite.config.ts: import tailwindcss from "@tailwindcss/vite"; add tailwindcss() to plugins',
    );
  } else {
    lines.push("Set up Tailwind CSS v4: https://tailwindcss.com/docs/installation");
  }
  lines.push(`  ${framework === "other" ? "" : "3. "}Add this line to the top of ${cssFile}:  @import "tailwindcss";`);
  lines.push("Then run materializedcss init again.");
  return lines.join("\n");
}

function aliasHint(prefix: string, srcDir: boolean): string {
  return [
    "Add an import alias to tsconfig.json so the copied components resolve:",
    `  "compilerOptions": { "baseUrl": ".", "paths": { "${prefix}/*": ["./${srcDir ? "src/" : ""}*"] } }`,
    "(Vite also needs the alias in vite.config.ts: resolve: { alias: { \"@\": path.resolve(__dirname, \"./src\") } }.)",
  ].join("\n");
}

async function promptAliases(context: CommandContext, initial: ConfigAliases): Promise<ConfigAliases> {
  const ask = (message: string, value: string): Promise<string> => context.prompter.text(message, value);
  return {
    components: await ask("Import alias for components:", initial.components),
    ui: await ask("Import alias for UI components:", initial.ui),
    lib: await ask("Import alias for lib:", initial.lib),
    hooks: await ask("Import alias for hooks:", initial.hooks),
    utils: await ask("Import alias for utils (cn):", initial.utils),
  };
}

function readExistingConfig(cwd: string, context: CommandContext): MaterializedConfig | undefined {
  try {
    return readConfig(cwd);
  } catch (error) {
    context.logger.warn(`Ignoring the existing ${CONFIG_FILE}: ${(error as Error).message}`);
    return undefined;
  }
}

/** Names exported by a module (`export function x`, `export const x`). */
function exportedNames(source: string): Set<string> {
  return new Set([...source.matchAll(/export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1] ?? ""));
}

/** `materializedcss init`: configure a project for the CLI. */
export async function runInit(options: InitOptions, context: CommandContext): Promise<InitResult> {
  const { logger, prompter } = context;
  const cwd = path.resolve(options.cwd);
  const project = getProjectInfo(cwd);
  const interactive = !options.yes && !options.defaults;

  logger.info(
    `Detected ${kleur.bold(FRAMEWORK_NAMES[project.framework])}` +
      `${project.srcDir ? " with a src/ directory" : ""}${project.rsc ? " (App Router)" : ""}.`,
  );

  const existing = readExistingConfig(cwd, context);
  if (existing && interactive) {
    const proceed = await prompter.confirm(`${CONFIG_FILE} already exists. Re-run setup and update it?`, true);
    if (!proceed) throw new CliError("Cancelled.", { exitCode: 1 });
  }

  // 1. Answers: aliases, stylesheet, RSC.
  const prefix = project.aliasPrefix ?? "@";
  let aliases = existing?.aliases ?? defaultAliases(prefix);
  let css = options.css ?? existing?.tailwind.css ?? project.cssFile ?? defaultCssFile(project);
  let rsc = options.rsc ?? existing?.rsc ?? project.rsc;
  if (interactive) {
    aliases = await promptAliases(context, aliases);
    if (!options.css) css = await prompter.text("Where is your global CSS file?", css);
    if (options.rsc === undefined) rsc = await prompter.confirm("Are you using React Server Components?", rsc);
  }
  css = toPosixRelative(cwd, path.resolve(cwd, css));

  // 2. Tailwind CSS v4 prerequisite.
  const cssPath = path.resolve(cwd, css);
  const cssText = readTextIfExists(cssPath);
  if (cssText === undefined || !hasTailwindImport(cssText)) {
    const v3 = (cssText !== undefined && hasTailwindV3Directives(cssText)) || (project.tailwindMajor ?? 4) < 4;
    const problem =
      cssText === undefined
        ? `No global stylesheet found at ${css}.`
        : `${css} does not import Tailwind CSS v4 (@import "tailwindcss";).`;
    const hint = tailwindInstructions(project.framework, css, v3);
    if (!options.yes) throw new CliError(problem, { hint: `${hint}\n(Pass --css <path> if your stylesheet lives elsewhere, or --yes to continue anyway.)` });
    logger.warn(problem);
    logger.log(kleur.dim(hint));
    logger.warn("Continuing because --yes was passed.");
  }

  // 3. materialized.json
  const config = createConfig({ rsc, css, aliases, registry: options.registry ?? existing?.registry });
  const paths = resolveConfigPaths(cwd, config, project);
  if (!project.tsconfig || paths.unmatched.length > 0) {
    logger.warn(
      project.tsconfig
        ? `No tsconfig "paths" entry matches ${paths.unmatched.join(", ")}; files will go to ${toPosixRelative(cwd, paths.ui)} etc.`
        : "No tsconfig.json or jsconfig.json found.",
    );
    logger.log(kleur.dim(aliasHint(prefix, project.srcDir)));
  }
  writeConfig(cwd, config);
  logger.success(`Wrote ${kleur.cyan(CONFIG_FILE)}.`);

  // 4. lib/utils.ts from the registry.
  const source = resolveRegistrySource(config.registry, cwd);
  const utils = await fetchRegistryItem(source, "utils");
  const planned = utils.files.flatMap((file) => {
    const target = resolveFileTarget(file, paths);
    return target ? [{ item: utils.name, target, content: transformSource(file.content, { aliases, rsc }) }] : [];
  });
  const files = await writeFiles(planned, { cwd, overwrite: options.force ?? false, yes: !interactive, dryRun: false, prompter });
  for (const file of files) {
    const rel = toPosixRelative(cwd, file.target);
    if (file.status === "created" || file.status === "updated") logger.success(`${file.status === "created" ? "Created" : "Updated"} ${kleur.cyan(rel)}.`);
    else if (file.status === "skipped") {
      const current = readTextIfExists(file.target) ?? "";
      const missing = [...exportedNames(file.content)].filter((name) => !exportedNames(current).has(name));
      if (missing.length > 0) {
        logger.warn(`Kept your ${rel}, but it is missing ${missing.join(", ")}. Re-run with --force to replace it, or add them by hand.`);
      } else {
        logger.info(`Kept your existing ${kleur.cyan(rel)} (it already exports everything materializedcss needs).`);
      }
    }
  }

  // 5. Theme import in the global stylesheet.
  let themeFile: string | undefined;
  let themeImport = THEME_PACKAGE_IMPORT;
  if (options.copyTheme) {
    themeFile = path.join(path.dirname(cssPath), COPIED_THEME_FILE);
    const theme = readTextIfExists(getBundledThemeFile()) ?? "";
    writeText(themeFile, theme.replace(/\r\n/g, "\n"));
    themeImport = toImportSpecifier(path.dirname(cssPath), themeFile);
    logger.success(`Copied the theme to ${kleur.cyan(toPosixRelative(cwd, themeFile))}.`);
  }
  const currentCss = readTextIfExists(cssPath);
  if (currentCss === undefined) {
    writeText(cssPath, createStylesheet(themeImport));
    logger.success(`Created ${kleur.cyan(css)}.`);
  } else {
    // Switching between package and copied theme: drop the other import.
    const other = options.copyTheme ? THEME_PACKAGE_IMPORT : `./${COPIED_THEME_FILE}`;
    const withoutOther = removeCssImport(currentCss, other).content;
    const edit = addCssImport(withoutOther, themeImport);
    if (edit.content !== currentCss) {
      writeText(cssPath, edit.content);
      logger.success(`Added ${kleur.cyan(`@import "${themeImport}";`)} to ${kleur.cyan(css)}.`);
    } else {
      logger.info(`${css} already imports ${themeImport}.`);
    }
  }

  // 6. Dependencies.
  const wanted = [
    ...BASE_DEPENDENCIES,
    ...(utils.dependencies ?? []),
    ...(options.copyTheme ? [] : [`materializedcss@^${getCliVersion()}`]),
  ];
  const dependencies = missingDependencies(project.packageJson, wanted);
  const manager = detectPackageManager(cwd, context.userAgent);
  let installed = false;
  if (dependencies.length === 0) {
    logger.info("Dependencies are already installed.");
  } else if (options.skipInstall) {
    const { command, args } = getInstallCommand(manager, dependencies);
    logger.info(`Skipped installing dependencies. Run: ${kleur.cyan(`${command} ${args.join(" ")}`)}`);
  } else {
    logger.info(`Installing ${dependencies.join(", ")} with ${manager}...`);
    await getInstaller(context)(cwd, manager, dependencies);
    installed = true;
    logger.success("Installed dependencies.");
  }

  logger.log();
  logger.success(kleur.bold("materializedcss is ready."));
  logger.log(`  Add components:  ${kleur.cyan("npx materializedcss add button")}`);
  logger.log(`  Browse them:     ${kleur.cyan("npx materializedcss list")}`);
  logger.log(kleur.dim("  Load the Roboto font (and Material Icons if you use <MaterialIcon>): see https://materializedcss.dev/docs/installation"));

  return { config, configFile: path.join(cwd, CONFIG_FILE), cssFile: cssPath, themeFile, files, dependencies, installed };
}
