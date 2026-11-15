// Prefixes "/images/…" asset paths with the basePath when the site is exported
// under a subpath (GitHub Pages). It runs on the compiled module only, so the
// example source shown in the docs' Code tabs stays the copy-pasteable original.
const path = require("node:path");

const appDirs = ["components", "registry"].map((dir) => path.join(__dirname, "..", dir) + path.sep);

/** @type {(this: { resourcePath: string; getOptions(): { basePath: string } }, source: string) => string} */
module.exports = function basePathLoader(source) {
  if (!appDirs.some((dir) => path.normalize(this.resourcePath).startsWith(dir))) return source;
  const { basePath } = this.getOptions();
  return source.replace(/(["'`])\/images\//g, `$1${basePath}/images/`);
};
