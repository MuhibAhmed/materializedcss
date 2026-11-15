import { readFileSync } from "node:fs";

import { fileExists, normalizeNewlines, toPosixRelative, writeText } from "./fs.ts";
import type { Prompter } from "./prompt.ts";

export type FileStatus = "created" | "updated" | "unchanged" | "skipped";

export interface PlannedFile {
  /** Registry item the file belongs to. */
  item: string;
  /** Absolute destination. */
  target: string;
  content: string;
}

export interface FileResult extends PlannedFile {
  status: FileStatus;
}

export interface WriteOptions {
  cwd: string;
  /** Replace changed files without asking. */
  overwrite: boolean;
  /** Non-interactive: changed files are skipped unless `overwrite`. */
  yes: boolean;
  /** Report what would happen without touching the disk. */
  dryRun: boolean;
  prompter: Prompter;
}

/** Compare a planned file with the disk. */
export function getFileState(file: PlannedFile): "missing" | "same" | "different" {
  if (!fileExists(file.target)) return "missing";
  return normalizeNewlines(readFileSync(file.target, "utf8")) === normalizeNewlines(file.content) ? "same" : "different";
}

/**
 * Write files: new files are created, identical files are left alone, and changed files are
 * overwritten only with `overwrite` or after confirmation (with `yes`, they are skipped).
 */
export async function writeFiles(files: readonly PlannedFile[], options: WriteOptions): Promise<FileResult[]> {
  // Later entries for the same target win (dedupe).
  const unique = [...new Map(files.map((file) => [file.target, file])).values()];
  const results: FileResult[] = [];
  for (const file of unique) {
    const state = getFileState(file);
    let status: FileStatus;
    if (state === "missing") status = "created";
    else if (state === "same") status = "unchanged";
    else if (options.overwrite) status = "updated";
    else if (options.yes || options.dryRun) status = "skipped";
    else {
      const replace = await options.prompter.confirm(
        `${toPosixRelative(options.cwd, file.target)} already exists and differs from the registry. Overwrite it?`,
        false,
      );
      status = replace ? "updated" : "skipped";
    }
    if (!options.dryRun && (status === "created" || status === "updated")) writeText(file.target, file.content);
    results.push({ ...file, status });
  }
  return results;
}
