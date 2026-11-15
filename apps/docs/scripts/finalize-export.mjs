// Post-processes the `next build` static export (apps/docs/out) for GitHub Pages.
//
// 1. The client prefetches route segments as flat files such as
//    `docs/theming/__next.docs.theming.__PAGE__.txt`, but the export writes them
//    nested (`docs/theming/__next.docs/theming/__PAGE__.txt`). On a plain static
//    host the flat names 404, so copy each nested file to its flat name.
// 2. Pages runs Jekyll by default, which skips folders starting with "_" (`_next`).
import { copyFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const out = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, "..", "out"));
let copied = 0;

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) flatten(full, dir, entry.name);
    else walk(full);
  }
}

function flatten(segmentDir, parent, prefix) {
  for (const entry of readdirSync(segmentDir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath, entry.name);
    const flat = [prefix, ...path.relative(segmentDir, file).split(path.sep)].join(".");
    copyFileSync(file, path.join(parent, flat));
    copied++;
  }
}

walk(out);
writeFileSync(path.join(out, ".nojekyll"), "");
console.log(`finalize-export: flattened ${copied} segment files in ${out}`);
