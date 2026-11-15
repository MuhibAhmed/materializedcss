import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { RegistryItem } from "../../src/cli/utils/registry-schema.ts";
import {
  fetchRegistryIndex,
  fetchRegistryItem,
  groupByCategory,
  normalizeRegistryItem,
  parseRegistryItem,
  resolveRegistryTree,
  suggestNames,
} from "../../src/cli/utils/registry.ts";
import { buildTestRegistry, makeTempDir, removeDir } from "./helpers.ts";

function item(name: string, registryDependencies: string[] = []): RegistryItem {
  return {
    name,
    type: "registry:ui",
    title: name,
    description: name,
    registryDependencies,
    files: [{ path: `components/ui/${name}.tsx`, type: "registry:ui", content: "" }],
  };
}

function fakeRegistry(items: RegistryItem[]): { get: (name: string) => Promise<RegistryItem>; calls: string[] } {
  const calls: string[] = [];
  const byName = new Map(items.map((entry) => [entry.name, entry]));
  return {
    calls,
    get: async (name) => {
      calls.push(name);
      const found = byName.get(name);
      if (!found) throw new Error(`missing ${name}`);
      return found;
    },
  };
}

describe("resolveRegistryTree", () => {
  it("orders dependencies before dependents and dedupes", async () => {
    const registry = fakeRegistry([
      item("utils"),
      item("use-ripple"),
      item("icons", ["utils"]),
      item("button", ["utils", "use-ripple"]),
      item("modal", ["button", "icons", "utils"]),
    ]);
    const result = await resolveRegistryTree(["modal", "button"], registry.get);
    const names = result.map((entry) => entry.name);
    expect(names).toEqual(["utils", "use-ripple", "button", "icons", "modal"]);
    expect(new Set(registry.calls).size).toBe(registry.calls.length);
  });

  it("detects cycles", async () => {
    const registry = fakeRegistry([item("a", ["b"]), item("b", ["a"])]);
    await expect(resolveRegistryTree(["a"], registry.get)).rejects.toThrow(/Circular registry dependency: a → b → a/);
  });
});

describe("registry items", () => {
  it("normalises shadcn-format items", () => {
    const normalized = normalizeRegistryItem({
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: "button",
      type: "registry:ui",
      title: "Button",
      description: "d",
      categories: ["actions"],
      registryDependencies: ["https://materializedcss.dev/r/utils.json", "use-ripple"],
      files: [{ path: "registry/materializedcss/components/ui/button.tsx", type: "registry:ui", content: "x" }],
    });
    const parsed = parseRegistryItem(normalized, "button");
    expect(parsed.category).toBe("Actions");
    expect(parsed.registryDependencies).toEqual(["utils", "use-ripple"]);
    expect(parsed.files[0]?.path).toBe("components/ui/button.tsx");
    expect(parsed.files[0]?.content).toBe("x");
  });

  it("rejects items without file content", () => {
    expect(() =>
      parseRegistryItem({ name: "x", type: "registry:ui", title: "X", description: "", files: [{ path: "a.tsx", type: "registry:ui" }] }, "x"),
    ).toThrow(/no content/);
  });

  it("groups by category in docs order", () => {
    const groups = groupByCategory([
      { name: "tabs", category: "Navigation" },
      { name: "button", category: "Actions" },
      { name: "utils" },
      { name: "icons", category: "Foundations" },
      { name: "zzz", category: "Custom" },
    ]);
    expect(groups.map(([category]) => category)).toEqual(["Foundations", "Actions", "Navigation", "Custom"]);
  });

  it("suggests close names", () => {
    expect(suggestNames("buton", ["button", "badge", "tabs"])).toEqual(["button"]);
  });
});

describe("directory registry", () => {
  let dir: string;
  beforeAll(() => {
    dir = makeTempDir();
    buildTestRegistry(dir);
  });
  afterAll(() => removeDir(dir));

  it("reads the index and items with content", async () => {
    const source = { kind: "dir" as const, dir };
    const index = await fetchRegistryIndex(source);
    expect(index.some((entry) => entry.name === "button")).toBe(true);
    const button = await fetchRegistryItem(source, "button");
    expect(button.files[0]?.content).toContain("export function Button");
    await expect(fetchRegistryItem(source, "nope")).rejects.toThrow(/not found/);
  });
});
