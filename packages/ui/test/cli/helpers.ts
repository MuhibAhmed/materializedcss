import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { CommandContext } from "../../src/cli/utils/context.ts";
import { createLogger } from "../../src/cli/utils/logger.ts";
import type { Prompter } from "../../src/cli/utils/prompt.ts";
import { registryItemMetaSchema } from "../../src/cli/utils/registry-schema.ts";

export const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export function makeTempDir(prefix = "mcss-cli-"): string {
  return mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function removeDir(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
}

/** Write a tree of files ({ "src/a.ts": "..." }) under `root`. */
export function writeTree(root: string, files: Record<string, string>): void {
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }
}

export function read(root: string, rel: string): string {
  return readFileSync(path.join(root, rel), "utf8");
}

/**
 * Build a registry directory (index.json + <name>.json with inlined content) from
 * `registry/*.json` and `src/`, like scripts/build-registry.ts, so tests do not need `dist/`.
 */
export function buildTestRegistry(outDir: string): void {
  const metaDir = path.join(packageRoot, "registry");
  const index: unknown[] = [];
  mkdirSync(outDir, { recursive: true });
  for (const file of readdirSync(metaDir).filter((name) => name.endsWith(".json"))) {
    const result = registryItemMetaSchema(JSON.parse(readFileSync(path.join(metaDir, file), "utf8")));
    if (!result.ok) throw new Error(`${file}: ${result.error}`);
    const meta = result.value;
    index.push(meta);
    const files = meta.files.map((entry) => ({
      ...entry,
      content: readFileSync(path.join(packageRoot, "src", entry.path), "utf8").replace(/\r\n/g, "\n"),
    }));
    writeFileSync(path.join(outDir, `${meta.name}.json`), JSON.stringify({ ...meta, files }, null, 2));
  }
  writeFileSync(path.join(outDir, "index.json"), JSON.stringify(index, null, 2));
}

/** A prompter that fails the test if a command asks anything. */
export const noPrompts: Prompter = {
  confirm: () => Promise.reject(new Error("unexpected confirm prompt")),
  text: () => Promise.reject(new Error("unexpected text prompt")),
  multiselect: () => Promise.reject(new Error("unexpected multiselect prompt")),
};

export interface TestContext extends CommandContext {
  output: string[];
  installs: string[][];
}

export function createTestContext(prompter: Prompter = noPrompts): TestContext {
  const output: string[] = [];
  const installs: string[][] = [];
  return {
    output,
    installs,
    logger: createLogger({ stdout: (line) => output.push(line), stderr: (line) => output.push(line) }),
    prompter,
    userAgent: undefined,
    install: async (_cwd, _manager, packages) => {
      installs.push([...packages]);
    },
  };
}
