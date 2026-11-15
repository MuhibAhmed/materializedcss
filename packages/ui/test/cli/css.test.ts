import { describe, expect, it } from "vitest";

import {
  addCssImport,
  hasImport,
  hasTailwindImport,
  hasTailwindV3Directives,
  removeCssImport,
  THEME_PACKAGE_IMPORT,
} from "../../src/cli/utils/css.ts";

describe("hasTailwindImport", () => {
  it.each([
    ['@import "tailwindcss";', true],
    ["@import 'tailwindcss';", true],
    ['@import "tailwindcss" source("../src");', true],
    ['@import url("tailwindcss");', true],
    ['@import "tailwindcss/theme.css" layer(theme);', true],
    ['@import "tailwindcss-animate";', false],
    ['/* @import "tailwindcss"; */', false],
    ["@tailwind base;", false],
  ])("%s -> %s", (css, expected) => {
    expect(hasTailwindImport(css)).toBe(expected);
  });

  it("detects Tailwind v3 directives", () => {
    expect(hasTailwindV3Directives("@tailwind base;\n@tailwind components;")).toBe(true);
    expect(hasTailwindV3Directives('@import "tailwindcss";')).toBe(false);
  });
});

describe("addCssImport", () => {
  it("inserts right after the Tailwind import", () => {
    const css = '@import "tailwindcss";\n\nbody { margin: 0; }\n';
    const { content, changed } = addCssImport(css, THEME_PACKAGE_IMPORT);
    expect(changed).toBe(true);
    expect(content).toBe('@import "tailwindcss";\n@import "materializedcss/theme.css";\n\nbody { margin: 0; }\n');
  });

  it("is idempotent", () => {
    const once = addCssImport('@import "tailwindcss";\n', THEME_PACKAGE_IMPORT).content;
    const twice = addCssImport(once, THEME_PACKAGE_IMPORT);
    expect(twice.changed).toBe(false);
    expect(twice.content).toBe(once);
    expect(once.match(/materializedcss\/theme\.css/g)).toHaveLength(1);
  });

  it("recognises an existing import with other quotes", () => {
    const css = "@import 'tailwindcss';\n@import 'materializedcss/theme.css';\n";
    expect(addCssImport(css, THEME_PACKAGE_IMPORT).changed).toBe(false);
  });

  it("goes after the last of several Tailwind imports and keeps CRLF", () => {
    const css = '@import "tailwindcss/theme.css" layer(theme);\r\n@import "tailwindcss/utilities.css" layer(utilities);\r\n.a{}\r\n';
    expect(addCssImport(css, "./materializedcss-theme.css").content).toBe(
      '@import "tailwindcss/theme.css" layer(theme);\r\n@import "tailwindcss/utilities.css" layer(utilities);\r\n@import "./materializedcss-theme.css";\r\n.a{}\r\n',
    );
  });

  it("handles a file without a trailing newline", () => {
    expect(addCssImport('@import "tailwindcss";', THEME_PACKAGE_IMPORT).content).toBe(
      '@import "tailwindcss";\n@import "materializedcss/theme.css";\n',
    );
  });

  it("falls back to after other imports, or the top", () => {
    expect(addCssImport('@import "./fonts.css";\n.a {}\n', "x.css").content).toBe('@import "./fonts.css";\n@import "x.css";\n.a {}\n');
    expect(addCssImport(".a {}\n", "x.css").content).toBe('@import "x.css";\n.a {}\n');
  });

  it("ignores imports inside comments", () => {
    const css = '/* @import "materializedcss/theme.css"; */\n@import "tailwindcss";\n';
    expect(hasImport(css, THEME_PACKAGE_IMPORT)).toBe(false);
    expect(addCssImport(css, THEME_PACKAGE_IMPORT).changed).toBe(true);
  });
});

describe("removeCssImport", () => {
  it("removes the whole line", () => {
    const css = '@import "tailwindcss";\n@import "materializedcss/theme.css";\n.a {}\n';
    expect(removeCssImport(css, THEME_PACKAGE_IMPORT)).toEqual({ content: '@import "tailwindcss";\n.a {}\n', changed: true });
  });
});
