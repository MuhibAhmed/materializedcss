/** The `@import` added by `init` in npm-theme mode. */
export const THEME_PACKAGE_IMPORT = "materializedcss/theme.css";
/** File name used by `init --copy-theme`, next to the global stylesheet. */
export const COPIED_THEME_FILE = "materializedcss-theme.css";

/** Matches an `@import "tailwindcss"` statement (also `tailwindcss/...`, `url(...)`, layer/source modifiers). */
const TAILWIND_IMPORT = /@import\s+(?:url\(\s*)?(["'])tailwindcss(?:\/[^"']*)?\1\s*\)?[^;\n]*;?/g;

/** True when the stylesheet imports Tailwind CSS v4 (`@import "tailwindcss";`). */
export function hasTailwindImport(css: string): boolean {
  return new RegExp(TAILWIND_IMPORT.source).test(stripCssComments(css));
}

/** True when the stylesheet uses Tailwind v3 directives (`@tailwind base;`). */
export function hasTailwindV3Directives(css: string): boolean {
  return /@tailwind\s+(base|components|utilities)\s*;/.test(stripCssComments(css));
}

/** Replace comments with spaces of the same length so indices stay valid. */
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whether `css` already has `@import "<specifier>"` (any quotes, optional url()). */
export function hasImport(css: string, specifier: string): boolean {
  return importPattern(specifier).test(stripCssComments(css));
}

function importPattern(specifier: string, flags = ""): RegExp {
  return new RegExp(`@import\\s+(?:url\\(\\s*)?(["'])${escapeRegExp(specifier)}\\1\\s*\\)?[^;\\n]*;?`, flags);
}

export interface CssEdit {
  content: string;
  changed: boolean;
}

/**
 * Add `@import "<specifier>";` right after the last `@import "tailwindcss..."`.
 * Idempotent: returns the input unchanged when the import is already present.
 * Without a Tailwind import, the line goes after the leading `@charset`/`@import`
 * block (or at the top).
 */
export function addCssImport(css: string, specifier: string): CssEdit {
  if (hasImport(css, specifier)) return { content: css, changed: false };
  const eol = css.includes("\r\n") ? "\r\n" : "\n";
  const line = `@import "${specifier}";`;
  const clean = stripCssComments(css);

  let insertAt = -1;
  for (const match of clean.matchAll(TAILWIND_IMPORT)) insertAt = match.index + match[0].length;

  if (insertAt === -1) {
    const leading = /^(?:\s*(?:@charset[^;]*;|@import[^;]*;))+/.exec(clean);
    insertAt = leading ? leading[0].length : 0;
  }

  if (insertAt === 0) return { content: `${line}${eol}${css}`, changed: true };
  // Keep anything after the statement on the same line (e.g. a trailing comment).
  const lineEnd = css.indexOf("\n", insertAt);
  const at = lineEnd === -1 ? css.length : css[lineEnd - 1] === "\r" ? lineEnd - 1 : lineEnd;
  const content = `${css.slice(0, at)}${eol}${line}${css.slice(at)}`;
  return { content: lineEnd === -1 && !content.endsWith(eol) ? content + eol : content, changed: true };
}

/** Remove every `@import "<specifier>"` line (used when switching theme modes). */
export function removeCssImport(css: string, specifier: string): CssEdit {
  const pattern = new RegExp(`^[ \\t]*${importPattern(specifier).source}[ \\t]*\\r?\\n?`, "gm");
  const content = css.replace(pattern, "");
  return { content, changed: content !== css };
}

/** A fresh stylesheet for projects that have none. */
export function createStylesheet(themeImport: string): string {
  return `@import "tailwindcss";\n@import "${themeImport}";\n`;
}
