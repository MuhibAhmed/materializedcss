/**
 * `tsc` keeps `@/…` path aliases in emitted declaration files. Rewrite them to
 * relative specifiers so the published `.d.ts` files resolve for consumers.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const dist = path.resolve(import.meta.dirname, "..", "dist");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const abs = path.join(dir, entry);
    return statSync(abs).isDirectory() ? walk(abs) : abs.endsWith(".d.ts") ? [abs] : [];
  });
}

let count = 0;
for (const file of walk(dist)) {
  const source = readFileSync(file, "utf8");
  const fixed = source.replace(/(from\s+|import\()(["'])@\/([^"']+)\2/g, (_match, prefix: string, quote: string, target: string) => {
    let relative = path.relative(path.dirname(file), path.join(dist, target)).replaceAll("\\", "/");
    if (!relative.startsWith(".")) relative = `./${relative}`;
    return `${prefix}${quote}${relative}.js${quote}`;
  });
  if (fixed !== source) {
    writeFileSync(file, fixed);
    count++;
  }
}
console.log(`fix-dts: rewrote aliases in ${count} declaration files`);
