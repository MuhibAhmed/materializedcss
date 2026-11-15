import { spawn } from "node:child_process";
import path from "node:path";

import { fileExists } from "./fs.ts";
import { CliError } from "./logger.ts";
import { allDependencies, type PackageJson } from "./project.ts";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const LOCKFILES: ReadonlyArray<readonly [string, PackageManager]> = [
  ["pnpm-lock.yaml", "pnpm"],
  ["yarn.lock", "yarn"],
  ["bun.lockb", "bun"],
  ["bun.lock", "bun"],
  ["package-lock.json", "npm"],
  ["npm-shrinkwrap.json", "npm"],
];

/** Package manager named by `npm_config_user_agent` (e.g. `pnpm/9.1.0 npm/? node/v22`). */
export function packageManagerFromUserAgent(userAgent: string | undefined): PackageManager | undefined {
  const name = userAgent?.split(" ")[0]?.split("/")[0];
  return name === "npm" || name === "pnpm" || name === "yarn" || name === "bun" ? name : undefined;
}

/**
 * Detect the package manager: a lockfile in `cwd` or a parent directory (monorepos) wins,
 * then the manager that launched the CLI (`npm_config_user_agent`), then npm.
 */
export function detectPackageManager(cwd: string, userAgent: string | undefined = process.env.npm_config_user_agent): PackageManager {
  let dir = path.resolve(cwd);
  for (;;) {
    for (const [lockfile, manager] of LOCKFILES) {
      if (fileExists(path.join(dir, lockfile))) return manager;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return packageManagerFromUserAgent(userAgent) ?? "npm";
}

export interface InstallCommand {
  command: string;
  args: string[];
}

export function getInstallCommand(manager: PackageManager, packages: readonly string[], options: { dev?: boolean } = {}): InstallCommand {
  const dev = options.dev ?? false;
  switch (manager) {
    case "npm":
      return { command: "npm", args: ["install", ...(dev ? ["--save-dev"] : []), ...packages] };
    case "pnpm":
      return { command: "pnpm", args: ["add", ...(dev ? ["-D"] : []), ...packages] };
    case "yarn":
      return { command: "yarn", args: ["add", ...(dev ? ["-D"] : []), ...packages] };
    case "bun":
      return { command: "bun", args: ["add", ...(dev ? ["-d"] : []), ...packages] };
  }
}

/** Packages (by name, ignoring `@version`) that the project does not declare yet. */
export function missingDependencies(pkg: PackageJson, packages: readonly string[]): string[] {
  const declared = allDependencies(pkg);
  const names = new Set<string>();
  const result: string[] = [];
  for (const spec of packages) {
    const name = packageName(spec);
    if (declared[name] !== undefined || names.has(name)) continue;
    names.add(name);
    result.push(spec);
  }
  return result;
}

/** `@scope/name@^1` → `@scope/name`, `name@1` → `name`. */
export function packageName(spec: string): string {
  const at = spec.indexOf("@", spec.startsWith("@") ? 1 : 0);
  return at === -1 ? spec : spec.slice(0, at);
}

/** Run the install command, streaming its output. Rejects with a `CliError` on failure. */
export async function installPackages(cwd: string, manager: PackageManager, packages: readonly string[]): Promise<void> {
  if (packages.length === 0) return;
  assertSafePackageSpecs(packages);
  const { command, args } = getInstallCommand(manager, packages);
  await new Promise<void>((resolve, reject) => {
    // Windows needs a shell to run npm.cmd / pnpm.cmd. The specs were validated above (no shell
    // metacharacters), so a single command line is safe and avoids Node's DEP0190 warning.
    const child =
      process.platform === "win32"
        ? spawn([command, ...args].join(" "), { cwd, stdio: "inherit", shell: true })
        : spawn(command, args, { cwd, stdio: "inherit" });
    child.on("error", (error) => reject(new CliError(`Could not run ${command}: ${error.message}`)));
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new CliError(`${command} ${args.join(" ")} failed with exit code ${String(code)}.`, {
            hint: `Install the packages yourself: ${command} ${args.join(" ")}`,
          }),
        );
    });
  });
}

/** Guard against shell metacharacters in package specs coming from a remote registry. */
export function assertSafePackageSpecs(packages: readonly string[]): void {
  for (const spec of packages) {
    if (!/^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(@[\w.^~*+-]+)?$/i.test(spec)) {
      throw new CliError(`Refusing to install suspicious package name "${spec}".`);
    }
  }
}
