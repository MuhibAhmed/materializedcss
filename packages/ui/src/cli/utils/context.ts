import type { Logger } from "./logger.ts";
import { installPackages, type PackageManager } from "./package-manager.ts";
import type { Prompter } from "./prompt.ts";

/** Everything a command needs from the outside world, injected so commands are testable. */
export interface CommandContext {
  logger: Logger;
  prompter: Prompter;
  /** Value of `npm_config_user_agent` (package-manager detection fallback). */
  userAgent?: string | undefined;
  /** Installs packages; defaults to spawning the package manager. */
  install?: (cwd: string, manager: PackageManager, packages: readonly string[]) => Promise<void>;
}

export function getInstaller(context: CommandContext): (cwd: string, manager: PackageManager, packages: readonly string[]) => Promise<void> {
  return context.install ?? installPackages;
}
