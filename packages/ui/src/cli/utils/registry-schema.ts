export type RegistryItemType = "registry:ui" | "registry:lib" | "registry:hook" | "registry:file" | "registry:style";

export interface RegistryFile {
  /** Path relative to the package `src/` directory, e.g. `components/ui/button.tsx`. */
  path: string;
  type: RegistryItemType;
  /** Optional explicit destination (relative to the project root) for `registry:file`. */
  target?: string;
}

export interface RegistryItemMeta {
  name: string;
  type: RegistryItemType;
  title: string;
  description: string;
  /** Sidebar group on the docs site. Items without a category are internal. */
  category?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
  /** What was fixed or improved compared with the original Materialize component. */
  improvements?: string[];
}

export interface RegistryItem extends Omit<RegistryItemMeta, "files"> {
  files: Array<RegistryFile & { content: string }>;
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

const ITEM_TYPES: ReadonlySet<string> = new Set([
  "registry:ui",
  "registry:lib",
  "registry:hook",
  "registry:file",
  "registry:style",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

/** Validate a registry meta file without pulling in a schema library. */
export function registryItemMetaSchema(input: unknown): ParseResult<RegistryItemMeta> {
  if (!isRecord(input)) return { ok: false, error: "expected an object" };
  const { name, type, title, description, category, dependencies, registryDependencies, files, improvements } = input;

  if (typeof name !== "string" || !/^[a-z0-9-]+$/.test(name)) return { ok: false, error: "name must be kebab-case" };
  if (typeof type !== "string" || !ITEM_TYPES.has(type)) return { ok: false, error: `invalid type "${String(type)}"` };
  if (typeof title !== "string") return { ok: false, error: "title must be a string" };
  if (typeof description !== "string") return { ok: false, error: "description must be a string" };
  if (category !== undefined && typeof category !== "string") return { ok: false, error: "category must be a string" };
  if (dependencies !== undefined && !isStringArray(dependencies)) return { ok: false, error: "dependencies must be string[]" };
  if (registryDependencies !== undefined && !isStringArray(registryDependencies)) {
    return { ok: false, error: "registryDependencies must be string[]" };
  }
  if (improvements !== undefined && !isStringArray(improvements)) return { ok: false, error: "improvements must be string[]" };
  if (!Array.isArray(files) || files.length === 0) return { ok: false, error: "files must be a non-empty array" };

  const parsedFiles: RegistryFile[] = [];
  for (const file of files) {
    if (!isRecord(file) || typeof file.path !== "string" || typeof file.type !== "string" || !ITEM_TYPES.has(file.type)) {
      return { ok: false, error: "each file needs a path and a valid type" };
    }
    if (file.target !== undefined && typeof file.target !== "string") return { ok: false, error: "file.target must be a string" };
    parsedFiles.push({
      path: file.path,
      type: file.type as RegistryItemType,
      ...(typeof file.target === "string" ? { target: file.target } : {}),
    });
  }

  return {
    ok: true,
    value: {
      name,
      type: type as RegistryItemType,
      title,
      description,
      ...(category !== undefined ? { category } : {}),
      ...(dependencies !== undefined ? { dependencies } : {}),
      ...(registryDependencies !== undefined ? { registryDependencies } : {}),
      ...(improvements !== undefined ? { improvements } : {}),
      files: parsedFiles,
    },
  };
}
