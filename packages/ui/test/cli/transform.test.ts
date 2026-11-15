import { describe, expect, it } from "vitest";

import { defaultAliases } from "../../src/cli/utils/config.ts";
import { rewriteImports, rewriteSpecifier, stripUseClient, transformSource } from "../../src/cli/utils/transform.ts";

const custom = {
  components: "~/ui-kit",
  ui: "~/ui-kit/primitives",
  lib: "#lib",
  hooks: "~/use",
  utils: "#lib/cn",
};

describe("rewriteSpecifier", () => {
  it.each([
    ["@/components/ui/button", "~/ui-kit/primitives/button"],
    ["@/components/ui", "~/ui-kit/primitives"],
    ["@/components/site-header", "~/ui-kit/site-header"],
    ["@/hooks/use-ripple", "~/use/use-ripple"],
    ["@/lib/utils", "#lib/cn"],
    ["@/lib/utils.ts", "#lib/cn"],
    ["@/lib/palette", "#lib/palette"],
    ["@/lib/utils-extra", "#lib/utils-extra"],
    ["@/other/thing", "@/other/thing"],
  ])("%s -> %s", (input, expected) => {
    expect(rewriteSpecifier(input, custom)).toBe(expected);
  });

  it("is a no-op with the default aliases", () => {
    expect(rewriteSpecifier("@/components/ui/button", defaultAliases())).toBe("@/components/ui/button");
  });
});

describe("rewriteImports", () => {
  const source = [
    '"use client";',
    "",
    'import * as React from "react";',
    'import { Slot } from "radix-ui";',
    "import { useRipple } from '@/hooks/use-ripple';",
    'import { cn, composeEventHandlers } from "@/lib/utils";',
    'import type { ButtonProps } from "@/components/ui/button";',
    'import "@/components/ui/styles.css";',
    'export { Icon } from "@/components/ui/icons";',
    'export * from "@/lib/palette";',
    'const Lazy = React.lazy(() => import("@/components/ui/modal"));',
    'const label = "@/components/ui/button";',
    "const doc = `see @/lib/utils for details`;",
    "// imports @/hooks/use-ripple from somewhere",
    "const obj = { from: 1 }; const x = obj.import;",
  ].join("\n");

  const output = rewriteImports(source, custom);

  it("rewrites import, export, side-effect and dynamic import specifiers", () => {
    expect(output).toContain("import { useRipple } from '~/use/use-ripple';");
    expect(output).toContain('import { cn, composeEventHandlers } from "#lib/cn";');
    expect(output).toContain('import type { ButtonProps } from "~/ui-kit/primitives/button";');
    expect(output).toContain('import "~/ui-kit/primitives/styles.css";');
    expect(output).toContain('export { Icon } from "~/ui-kit/primitives/icons";');
    expect(output).toContain('export * from "#lib/palette";');
    expect(output).toContain('import("~/ui-kit/primitives/modal")');
  });

  it("leaves other strings, comments and packages alone", () => {
    expect(output).toContain('const label = "@/components/ui/button";');
    expect(output).toContain("const doc = `see @/lib/utils for details`;");
    expect(output).toContain("// imports @/hooks/use-ripple from somewhere");
    expect(output).toContain('import { Slot } from "radix-ui";');
    expect(output).toContain('import * as React from "react";');
    expect(output).toContain("const obj = { from: 1 }; const x = obj.import;");
  });

  it("handles multi-line imports", () => {
    const multi = 'import {\n  cn,\n  composeEventHandlers,\n} from "@/lib/utils";';
    expect(rewriteImports(multi, custom)).toBe('import {\n  cn,\n  composeEventHandlers,\n} from "#lib/cn";');
  });
});

describe("stripUseClient", () => {
  it("removes a leading directive with either quote style", () => {
    expect(stripUseClient('"use client";\n\nimport x from "y";\n')).toBe('import x from "y";\n');
    expect(stripUseClient("'use client'\nimport x from 'y';")).toBe("import x from 'y';");
    expect(stripUseClient('\r\n"use client";\r\nconst a = 1;')).toBe("const a = 1;");
  });

  it("keeps directives that are not at the top and other strings", () => {
    const source = 'import x from "y";\nconst s = "use client";\n';
    expect(stripUseClient(source)).toBe(source);
  });
});

describe("transformSource", () => {
  const source = '"use client";\r\n\r\nimport { cn } from "@/lib/utils";\r\n';

  it("strips use client when rsc is false and normalises line endings", () => {
    expect(transformSource(source, { aliases: custom, rsc: false })).toBe('import { cn } from "#lib/cn";\n');
  });

  it("keeps use client when rsc is true", () => {
    expect(transformSource(source, { aliases: custom, rsc: true })).toBe('"use client";\n\nimport { cn } from "#lib/cn";\n');
  });
});
