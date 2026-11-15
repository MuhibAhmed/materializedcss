import { describe, expect, it } from "vitest";

import { createHunks, createUnifiedDiff, diffLines, splitLines, type DiffOp } from "../../src/cli/utils/diff.ts";

/** Apply an edit script to check it reproduces both sides. */
function sides(ops: DiffOp[]): { a: string[]; b: string[] } {
  return {
    a: ops.filter((op) => op.type !== "insert").map((op) => op.line),
    b: ops.filter((op) => op.type !== "delete").map((op) => op.line),
  };
}

describe("diffLines", () => {
  it("finds a minimal edit script", () => {
    const a = ["a", "b", "c", "a", "b", "b", "a"];
    const b = ["c", "b", "a", "b", "a", "c"];
    const ops = diffLines(a, b);
    expect(sides(ops)).toEqual({ a, b });
    // Myers' classic example has an edit distance of 5.
    expect(ops.filter((op) => op.type !== "equal")).toHaveLength(5);
  });

  it("handles empty inputs", () => {
    expect(diffLines([], [])).toEqual([]);
    expect(diffLines([], ["x"])).toEqual([{ type: "insert", line: "x" }]);
    expect(diffLines(["x"], [])).toEqual([{ type: "delete", line: "x" }]);
  });

  it("round-trips random inputs", () => {
    let seed = 7;
    const random = (): number => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let run = 0; run < 50; run++) {
      const a = Array.from({ length: Math.floor(random() * 20) }, () => String(Math.floor(random() * 4)));
      const b = Array.from({ length: Math.floor(random() * 20) }, () => String(Math.floor(random() * 4)));
      expect(sides(diffLines(a, b))).toEqual({ a, b });
    }
  });
});

describe("unified diff", () => {
  it("is empty for equal texts, ignoring line endings", () => {
    expect(createUnifiedDiff("a\r\nb\r\n", "a\nb\n")).toBe("");
    expect(splitLines("a\nb\n")).toEqual(["a", "b"]);
  });

  it("prints hunks with context and line numbers", () => {
    const before = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`);
    const after = [...before];
    after[1] = "changed 2";
    after.splice(15, 1);
    const patch = createUnifiedDiff(before.join("\n"), after.join("\n"), { oldLabel: "local", newLabel: "registry" });
    expect(patch).toBe(
      [
        "--- local",
        "+++ registry",
        "@@ -1,5 +1,5 @@",
        " line 1",
        "-line 2",
        "+changed 2",
        " line 3",
        " line 4",
        " line 5",
        "@@ -13,7 +13,6 @@",
        " line 13",
        " line 14",
        " line 15",
        "-line 16",
        " line 17",
        " line 18",
        " line 19",
      ].join("\n"),
    );
  });

  it("merges nearby changes into one hunk", () => {
    const ops = diffLines(["a", "b", "c", "d"], ["A", "b", "c", "D"]);
    expect(createHunks(ops, 1)).toHaveLength(1);
  });
});
