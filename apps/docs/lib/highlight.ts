import "server-only";

import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["tsx", "ts", "bash", "css", "json"],
  });
  return highlighter;
}

export type CodeLang = "tsx" | "ts" | "bash" | "css" | "json";

/** Highlight code to HTML with light/dark CSS variables (see globals.css). */
export async function highlight(code: string, lang: CodeLang = "tsx"): Promise<string> {
  const shiki = await getHighlighter();
  return shiki.codeToHtml(code.trimEnd(), {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}
