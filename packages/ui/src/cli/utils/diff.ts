export type DiffOp = { type: "equal" | "insert" | "delete"; line: string };

/** Split text into lines, ignoring CRLF vs LF and a trailing newline. */
export function splitLines(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n");
  if (normalized === "") return [];
  return (normalized.endsWith("\n") ? normalized.slice(0, -1) : normalized).split("\n");
}

/**
 * Line diff using Myers' O(ND) algorithm. Returns the edit script from `a` to `b`
 * (deletions before insertions within a change).
 */
export function diffLines(a: readonly string[], b: readonly string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  const offset = max + 1;
  const v = new Array<number>(2 * max + 3).fill(0);
  const trace: number[][] = [];

  outer: for (let d = 0; d <= max; d++) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      const down = k === -d || (k !== d && (v[offset + k - 1] ?? 0) < (v[offset + k + 1] ?? 0));
      let x = down ? (v[offset + k + 1] ?? 0) : (v[offset + k - 1] ?? 0) + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) break outer;
    }
  }

  // Backtrack through the saved V arrays.
  const ops: DiffOp[] = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d >= 0; d--) {
    const vd = trace[d] ?? [];
    const k = x - y;
    const down = k === -d || (k !== d && (vd[offset + k - 1] ?? 0) < (vd[offset + k + 1] ?? 0));
    const prevK = down ? k + 1 : k - 1;
    const prevX = vd[offset + prevK] ?? 0;
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      ops.push({ type: "equal", line: a[x - 1] ?? "" });
      x--;
      y--;
    }
    if (d > 0) {
      if (down) ops.push({ type: "insert", line: b[y - 1] ?? "" });
      else ops.push({ type: "delete", line: a[x - 1] ?? "" });
      x = prevX;
      y = prevY;
    }
  }
  return ops.reverse();
}

export interface Hunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  ops: DiffOp[];
}

/** Group an edit script into hunks with `context` unchanged lines around each change. */
export function createHunks(ops: readonly DiffOp[], context = 3): Hunk[] {
  const hunks: Hunk[] = [];
  const changeIndexes = ops.flatMap((op, index) => (op.type === "equal" ? [] : [index]));
  if (changeIndexes.length === 0) return hunks;

  // Merge change ranges whose context overlaps.
  const ranges: Array<[number, number]> = [];
  for (const index of changeIndexes) {
    const start = Math.max(0, index - context);
    const end = Math.min(ops.length - 1, index + context);
    const last = ranges[ranges.length - 1];
    if (last && start <= last[1] + 1) last[1] = Math.max(last[1], end);
    else ranges.push([start, end]);
  }

  // Line numbers (1-based) at each op index.
  let oldLine = 1;
  let newLine = 1;
  const positions = ops.map((op) => {
    const position = { old: oldLine, new: newLine };
    if (op.type !== "insert") oldLine++;
    if (op.type !== "delete") newLine++;
    return position;
  });

  for (const [start, end] of ranges) {
    const slice = ops.slice(start, end + 1);
    const oldLines = slice.filter((op) => op.type !== "insert").length;
    const newLines = slice.filter((op) => op.type !== "delete").length;
    const position = positions[start] ?? { old: 1, new: 1 };
    hunks.push({
      oldStart: oldLines === 0 ? position.old - 1 : position.old,
      oldLines,
      newStart: newLines === 0 ? position.new - 1 : position.new,
      newLines,
      ops: slice,
    });
  }
  return hunks;
}

export interface UnifiedDiffOptions {
  oldLabel?: string;
  newLabel?: string;
  context?: number;
  /** Colorize lines (e.g. with kleur). Defaults to identity. */
  color?: { added: (s: string) => string; removed: (s: string) => string; header: (s: string) => string };
}

/** A unified diff of two texts, or an empty string when they are equal (ignoring line endings). */
export function createUnifiedDiff(oldText: string, newText: string, options: UnifiedDiffOptions = {}): string {
  const hunks = createHunks(diffLines(splitLines(oldText), splitLines(newText)), options.context ?? 3);
  if (hunks.length === 0) return "";
  const identity = (s: string): string => s;
  const color = options.color ?? { added: identity, removed: identity, header: identity };
  const lines = [color.removed(`--- ${options.oldLabel ?? "a"}`), color.added(`+++ ${options.newLabel ?? "b"}`)];
  for (const hunk of hunks) {
    lines.push(color.header(`@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`));
    for (const op of hunk.ops) {
      if (op.type === "equal") lines.push(` ${op.line}`);
      else if (op.type === "delete") lines.push(color.removed(`-${op.line}`));
      else lines.push(color.added(`+${op.line}`));
    }
  }
  return lines.join("\n");
}
