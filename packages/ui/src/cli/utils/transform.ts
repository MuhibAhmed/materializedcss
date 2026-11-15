import type { ConfigAliases } from "./config.ts";

/**
 * Module specifiers in import/export/require/dynamic-import positions:
 *   import x from "s"   import type { X } from "s"   export * from "s"
 *   import "s"          import("s")                  require("s")
 * Group 1 is the keyword part, 2 the quote, 3 the specifier.
 */
const SPECIFIER =
  /(\bfrom\s*|\bimport\s*\(\s*|(?<![.\w$])import\s+|\brequire\s*\(\s*|\bvi\.mock\s*\(\s*|\bjest\.mock\s*\(\s*)(["'])(@\/[^"'\n]*)\2/g;

/** Map one source alias (`@/components/ui/x`) to the project's aliases. Unknown `@/` paths are left alone. */
export function rewriteSpecifier(specifier: string, aliases: ConfigAliases): string {
  const rules: Array<[RegExp, (rest: string) => string]> = [
    [/^@\/components\/ui(\/.*)?$/, (rest) => aliases.ui + rest],
    [/^@\/components(\/.*)?$/, (rest) => aliases.components + rest],
    [/^@\/hooks(\/.*)?$/, (rest) => aliases.hooks + rest],
    [/^@\/lib\/utils(?:\.[cm]?[jt]sx?)?$/, () => aliases.utils],
    [/^@\/lib(\/.*)?$/, (rest) => aliases.lib + rest],
  ];
  for (const [pattern, replace] of rules) {
    const match = pattern.exec(specifier);
    if (match) return replace(match[1] ?? "");
  }
  return specifier;
}

/** Rewrite every `@/...` import specifier to the configured aliases. Other strings are untouched. */
export function rewriteImports(source: string, aliases: ConfigAliases): string {
  return source.replace(SPECIFIER, (_match, keyword: string, quote: string, specifier: string) => {
    return `${keyword}${quote}${rewriteSpecifier(specifier, aliases)}${quote}`;
  });
}

/** Remove a leading `"use client";` directive (and the blank lines after it). */
export function stripUseClient(source: string): string {
  return source.replace(/^(﻿)?\s*(["'])use client\2;?[ \t]*(?:\r?\n)*/, "$1");
}

export interface TransformOptions {
  aliases: ConfigAliases;
  /** When false, `"use client"` directives are removed. */
  rsc: boolean;
}

/** Prepare registry source for a user's project. */
export function transformSource(source: string, options: TransformOptions): string {
  let output = rewriteImports(source.replace(/\r\n/g, "\n"), options.aliases);
  if (!options.rsc) output = stripUseClient(output);
  return output;
}
