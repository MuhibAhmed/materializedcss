import path from "node:path";

import type { ResolvedPaths } from "./config.ts";
import { CliError } from "./logger.ts";
import type { RegistryFile } from "./registry-schema.ts";

/** Join `rel` onto `base`, refusing paths that escape it (a remote registry could send `../../x`). */
function safeJoin(base: string, rel: string, label: string): string {
  const target = path.resolve(base, rel);
  const relative = path.relative(base, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new CliError(`Refusing to write ${label} outside ${base}: ${rel}`);
  }
  return target;
}

/**
 * Absolute destination of a registry file in the user's project, or `undefined`
 * for files that are not copied (`registry:style`).
 *
 * @param uiDirOverride `add --path <dir>`: where UI components go instead of the `ui` alias.
 */
export function resolveFileTarget(file: RegistryFile, paths: ResolvedPaths, uiDirOverride?: string): string | undefined {
  switch (file.type) {
    case "registry:ui":
      return safeJoin(uiDirOverride ?? paths.ui, file.path.replace(/^components\/ui\//, ""), file.path);
    case "registry:hook":
      return safeJoin(paths.hooks, file.path.replace(/^hooks\//, ""), file.path);
    case "registry:lib": {
      const utils = /^lib\/utils(\.[cm]?[jt]sx?)$/.exec(file.path);
      if (utils) return `${paths.utils}${utils[1] ?? ".ts"}`;
      return safeJoin(paths.lib, file.path.replace(/^lib\//, ""), file.path);
    }
    case "registry:file":
      if (!file.target) throw new CliError(`Registry file ${file.path} has type registry:file but no target.`);
      return safeJoin(paths.cwd, file.target, file.path);
    case "registry:style":
      return undefined;
  }
}
