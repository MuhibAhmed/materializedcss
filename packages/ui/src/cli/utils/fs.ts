import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

export function fileExists(file: string): boolean {
  try {
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

export function dirExists(dir: string): boolean {
  try {
    return statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

/** Read a UTF-8 file, or `undefined` when it does not exist. */
export function readTextIfExists(file: string): string | undefined {
  if (!existsSync(file)) return undefined;
  return readFileSync(file, "utf8");
}

/** Write a UTF-8 file, creating parent directories. */
export function writeText(file: string, content: string): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content, "utf8");
}

/** Normalise line endings so CRLF checkouts compare equal to LF registry content. */
export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

/** `path.relative` with forward slashes, for display and config files. */
export function toPosixRelative(from: string, to: string): string {
  const rel = path.relative(from, to).split(path.sep).join("/");
  return rel === "" ? "." : rel;
}

/** Turn a relative path into an import specifier (`./x`, `../x`). */
export function toImportSpecifier(fromDir: string, toFile: string): string {
  const rel = toPosixRelative(fromDir, toFile);
  return rel.startsWith("./") || rel.startsWith("../") ? rel : `./${rel}`;
}
