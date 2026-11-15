import { CodeBlock } from "~/components/docs/code-block";
import { SimpleTabs } from "~/components/docs/simple-tabs";
import { getRegistry, getRegistryItem, readUiSource, type RegistryMeta } from "~/lib/registry";
import { siteConfig } from "~/lib/site";

/** Every registry item this one needs, depth first, excluding itself. */
function collectDependencies(item: RegistryMeta, seen = new Set<string>()): RegistryMeta[] {
  const registry = getRegistry();
  const result: RegistryMeta[] = [];
  for (const name of item.registryDependencies ?? []) {
    if (seen.has(name)) continue;
    seen.add(name);
    const dep = registry.find((entry) => entry.name === name);
    if (!dep) continue;
    result.push(...collectDependencies(dep, seen), dep);
  }
  return result;
}

function toPascal(name: string): string {
  return name.replace(/(^|-)([a-z])/g, (_m, _dash: string, char: string) => char.toUpperCase());
}

/** Install instructions (CLI, shadcn, npm package, manual) for a registry item. */
export async function Installation({ name }: { name: string }): Promise<React.JSX.Element> {
  const item = getRegistryItem(name);
  if (!item) throw new Error(`Unknown registry item "${name}"`);

  const deps = collectDependencies(item);
  const npmDeps = [...new Set([...deps, item].flatMap((entry) => entry.dependencies ?? []))];
  const files = [...deps.filter((dep) => dep.name !== "utils"), item].flatMap((entry) => entry.files);
  const firstExport = toPascal(name);

  return (
    <SimpleTabs
      label="Installation method"
      className="my-6"
      tabs={[
        {
          value: "cli",
          label: "CLI",
          content: <CodeBlock code={`npx materializedcss add ${name}`} lang="bash" />,
        },
        {
          value: "shadcn",
          label: "shadcn",
          content: (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Every component is also a shadcn-compatible registry item.</p>
              <CodeBlock code={`npx shadcn@latest add ${siteConfig.registryUrl}/${name}.json`} lang="bash" />
            </div>
          ),
        },
        {
          value: "npm",
          label: "npm package",
          content: (
            <div className="space-y-3">
              <CodeBlock code="npm install materializedcss" lang="bash" />
              <CodeBlock
                title="app/globals.css"
                lang="css"
                code={`@import "tailwindcss";\n@import "materializedcss/styles.css";`}
              />
              <CodeBlock code={`import { ${firstExport} } from "materializedcss/${name}";`} lang="tsx" />
            </div>
          ),
        },
        {
          value: "manual",
          label: "Manual",
          content: (
            <div className="space-y-4">
              {npmDeps.length ? (
                <>
                  <p className="text-sm text-muted-foreground">Install the dependencies:</p>
                  <CodeBlock code={`npm install ${npmDeps.join(" ")}`} lang="bash" />
                </>
              ) : null}
              <p className="text-sm text-muted-foreground">
                Copy the source into your project (the <code>cn</code> helper lives in <code>lib/utils.ts</code>):
              </p>
              {files.map((file) => (
                <CodeBlock key={file.path} title={file.path} code={readUiSource(file.path)} maxHeight={420} />
              ))}
            </div>
          ),
        },
      ]}
    />
  );
}
