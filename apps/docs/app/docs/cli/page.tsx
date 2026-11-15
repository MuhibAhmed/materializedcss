import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "~/components/docs/code-block";
import { Callout, DocHeader, DocSection, DocSubheading, PagerLinks } from "~/components/docs/doc-parts";
import { SimpleTabs } from "~/components/docs/simple-tabs";
import { siteConfig } from "~/lib/site";

export const metadata: Metadata = {
  title: "CLI",
  description: "Reference for the materializedcss CLI: init, add, list and diff, every flag, and the materialized.json file.",
};

interface Row {
  name: string;
  description: React.ReactNode;
}

/** Two-column reference table (flag or field, description). */
function RefTable({ rows, head }: { rows: Row[]; head: [string, string] }): React.JSX.Element {
  return (
    <div tabIndex={0} role="region" aria-label="Reference table" className="my-4 overflow-x-auto rounded-md border border-border outline-none focus-visible:focus-ring">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-2 text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">{head[0]}</th>
            <th className="px-4 py-2.5 font-medium">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-border align-top">
              <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[13px] text-secondary">{row.name}</td>
              <td className="px-4 py-2.5 text-muted-foreground [&_code]:rounded [&_code]:bg-surface-hover [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-foreground">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const configExample = `{
  "$schema": "https://materializedcss.dev/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks",
    "utils": "@/lib/utils"
  }
}`;

const initOutput = `$ npx materializedcss init --yes
i Detected Next.js with a src/ directory (App Router).
✔ Wrote materialized.json.
✔ Created src/lib/utils.ts.
✔ Added @import "materializedcss/theme.css"; to src/app/globals.css.
i Installing tailwind-merge, class-variance-authority, materializedcss@^0.1.0 with npm...
✔ materializedcss is ready.`;

const addOutput = `$ npx materializedcss add button --yes
Created (2):
  src/hooks/use-ripple.ts
  src/components/ui/button.tsx
Unchanged (1):
  src/lib/utils.ts
i Installing radix-ui with npm...`;

const diffOutput = `$ npx materializedcss diff button
--- src/components/ui/button.tsx (local)
+++ src/components/ui/button.tsx (registry)
@@ -40,7 +40,7 @@
       variant: {
-        raised: "bg-primary text-white shadow-z2",
+        raised: "bg-primary text-primary-foreground shadow-z2 hover:shadow-z3",
         flat: "bg-transparent text-foreground shadow-none",`;

export default function CliPage(): React.JSX.Element {
  return (
    <article data-doc-content>
      <DocHeader
        eyebrow="Getting Started"
        title="CLI"
        description="Use the materializedcss CLI to set up a project, copy components into it, and keep your copies in sync with the registry."
      />

      <div className="docs-prose">
        <p>
          The CLI ships inside the <code>materializedcss</code> package and needs Node.js 22 or newer. Run it with your
          package runner. Nothing is installed globally:
        </p>
      </div>
      <SimpleTabs
        label="Package runner"
        className="my-4"
        tabs={[
          { value: "npm", label: "npm", content: <CodeBlock lang="bash" code="npx materializedcss@latest <command>" /> },
          { value: "pnpm", label: "pnpm", content: <CodeBlock lang="bash" code="pnpm dlx materializedcss@latest <command>" /> },
          { value: "yarn", label: "yarn", content: <CodeBlock lang="bash" code="yarn dlx materializedcss@latest <command>" /> },
          { value: "bun", label: "bun", content: <CodeBlock lang="bash" code="bunx materializedcss@latest <command>" /> },
        ]}
      />

      <DocSection title="init">
        <p>
          Configures your project. It reads <code>package.json</code> to detect the framework (Next.js, Vite, React
          Router, Astro), checks for a <code>src/</code> directory, reads the import alias from{" "}
          <code>tsconfig.json</code> (following <code>extends</code> and project references) or{" "}
          <code>jsconfig.json</code>, and finds your global stylesheet.
        </p>
        <CodeBlock className="mt-3" lang="bash" code="npx materializedcss init" />
        <p className="mt-3">Then it:</p>
        <ul>
          <li>
            writes <code>materialized.json</code>;
          </li>
          <li>
            writes <code>lib/utils.ts</code> (<code>cn()</code> and small helpers). An existing file that differs is kept
            unless you confirm or pass <code>--force</code>;
          </li>
          <li>
            adds <code>@import &quot;materializedcss/theme.css&quot;;</code> right after <code>@import &quot;tailwindcss&quot;;</code>.
            Running it again won&apos;t add a second import;
          </li>
          <li>
            installs <code>clsx</code>, <code>tailwind-merge</code>, <code>class-variance-authority</code> and{" "}
            <code>materializedcss</code> (which provides the theme file) with your package manager.
          </li>
        </ul>
        <p className="mt-3">
          If the stylesheet doesn&apos;t import Tailwind CSS v4, <code>init</code> prints setup steps for your framework
          and exits with code 1. <code>--yes</code> continues anyway.
        </p>
        <CodeBlock className="mt-3" lang="bash" code={initOutput} />
        <DocSubheading>Options</DocSubheading>
        <RefTable
          head={["Flag", "Description"]}
          rows={[
            { name: "-y, --yes", description: "Skip every prompt: default answers, no confirmations, and continue even without Tailwind CSS v4." },
            { name: "-d, --defaults", description: "Use the default aliases and detected values without prompting (still stops if Tailwind is missing)." },
            { name: "-c, --cwd <dir>", description: "Project directory. Defaults to the current directory." },
            { name: "--css <path>", description: "Global stylesheet, relative to the project. Detected from app/globals.css, src/index.css, src/styles/globals.css and other common locations." },
            {
              name: "--copy-theme",
              description: (
                <>
                  Copy the theme into <code>&lt;css dir&gt;/materializedcss-theme.css</code> and import it relatively. The
                  project then has no runtime dependency on the package, and you can edit the tokens in place.
                </>
              ),
            },
            {
              name: "--rsc / --no-rsc",
              description: (
                <>
                  Override React Server Components detection (on for Next.js with an <code>app/</code> directory). With{" "}
                  <code>rsc: false</code>, <code>&quot;use client&quot;</code> directives are removed from copied files.
                </>
              ),
            },
            { name: "--skip-install", description: "Don't install dependencies. The install command is printed instead." },
            { name: "-f, --force", description: "Replace an existing lib/utils.ts that differs from the registry version." },
            { name: "--registry <url>", description: "Read components from another registry and save it in materialized.json." },
          ]}
        />
      </DocSection>

      <DocSection title="add">
        <p>
          Copies components into your project together with the hooks and helpers they depend on, then installs their npm
          dependencies in one command. Run it without names to pick components from a searchable list.
        </p>
        <CodeBlock className="mt-3" lang="bash" code={`npx materializedcss add button card\nnpx materializedcss add          # interactive picker\nnpx materializedcss add --all`} />
        <CodeBlock className="mt-3" lang="bash" code={addOutput} />
        <DocSubheading>Where files go</DocSubheading>
        <p>
          Each registry file has a type. Destinations come from your aliases, resolved to folders through your
          tsconfig <code>paths</code> (<code>@/*</code> → <code>./src/*</code> puts <code>@/components/ui</code> in{" "}
          <code>src/components/ui</code>).
        </p>
        <RefTable
          head={["Type", "Destination"]}
          rows={[
            { name: "registry:ui", description: <>The <code>ui</code> alias, or <code>--path</code>.</> },
            { name: "registry:hook", description: <>The <code>hooks</code> alias.</> },
            { name: "registry:lib", description: <>The <code>lib</code> alias (<code>lib/utils.ts</code> goes to the <code>utils</code> alias).</> },
            { name: "registry:file", description: <>The file&apos;s <code>target</code>, relative to the project root.</> },
          ]}
        />
        <DocSubheading>How source is transformed</DocSubheading>
        <ul>
          <li>
            Imports are rewritten to your aliases: <code>@/components/ui/x</code> → <code>ui</code>,{" "}
            <code>@/components/x</code> → <code>components</code>, <code>@/hooks/x</code> → <code>hooks</code>,{" "}
            <code>@/lib/utils</code> → <code>utils</code>, <code>@/lib/x</code> → <code>lib</code>. Only module specifiers
            change. Other strings stay as they are.
          </li>
          <li>
            With <code>&quot;rsc&quot;: false</code>, the leading <code>&quot;use client&quot;;</code> is removed.
          </li>
          <li>
            Files identical to the registry version are left alone. If a file differs, the CLI asks before overwriting it.
            With <code>--yes</code>, changed files are skipped with a warning, and <code>--overwrite</code> replaces them.
          </li>
        </ul>
        <DocSubheading>Options</DocSubheading>
        <RefTable
          head={["Flag", "Description"]}
          rows={[
            { name: "[components...]", description: "Component names, e.g. button text-field. Unknown names fail with suggestions." },
            { name: "-a, --all", description: "Add every component." },
            { name: "-y, --yes", description: "No prompts. Runs init with defaults if materialized.json is missing; keeps existing files that differ." },
            { name: "-o, --overwrite", description: "Overwrite existing files that differ, without asking." },
            { name: "-c, --cwd <dir>", description: "Project directory." },
            { name: "-p, --path <dir>", description: "Put UI components in this directory instead of the ui alias." },
            { name: "--skip-install", description: "Don't install npm dependencies (the command is printed)." },
            { name: "--dry-run", description: "Show what would be created, updated or skipped, and which packages would be installed, without changing anything." },
            { name: "--registry <url>", description: "Use another registry for this run (overrides materialized.json)." },
          ]}
        />
      </DocSection>

      <DocSection title="list">
        <p>Prints every component grouped by category, with its description.</p>
        <CodeBlock className="mt-3" lang="bash" code={`npx materializedcss list\nnpx materializedcss list --json   # name, title, description, category, dependencies`} />
        <RefTable
          head={["Flag", "Description"]}
          rows={[
            { name: "--json", description: "Machine-readable output." },
            { name: "-c, --cwd <dir>", description: "Project directory (its materialized.json registry is used)." },
            { name: "--registry <url>", description: "List another registry." },
          ]}
        />
      </DocSection>

      <DocSection title="diff">
        <p>
          Compares your copies with the registry version, after applying your aliases and RSC setting, so only real
          changes show up. Without an argument it lists the components that differ. With a name it prints a unified line
          diff.
        </p>
        <CodeBlock className="mt-3" lang="bash" code={diffOutput} />
        <p className="mt-3">
          To take the registry version, run <code>npx materializedcss add button --overwrite</code>. Options:{" "}
          <code>--cwd</code>, <code>--path</code> (if you used <code>add --path</code>) and <code>--registry</code>.
        </p>
      </DocSection>

      <DocSection title="materialized.json">
        <p>
          Created by <code>init</code> and read by every other command. It has the same shape as shadcn&apos;s{" "}
          <code>components.json</code>, so the fields will look familiar.
        </p>
        <CodeBlock className="mt-3" title="materialized.json" lang="json" code={configExample} />
        <RefTable
          head={["Field", "Description"]}
          rows={[
            { name: "$schema", description: "JSON schema URL for editor completion." },
            { name: "style", description: <>Always <code>&quot;default&quot;</code> (reserved for future styles).</> },
            { name: "rsc", description: <>Keep <code>&quot;use client&quot;</code> directives (React Server Components). <code>false</code> strips them.</> },
            { name: "tsx", description: "Components are TypeScript (.tsx). Always true." },
            { name: "tailwind.css", description: "Global stylesheet that imports Tailwind and the theme." },
            { name: "tailwind.cssVariables", description: "Theme colors are CSS variables (always true; they switch automatically in dark mode)." },
            { name: "aliases.components", description: <>Import alias for app components (<code>@/components</code>).</> },
            { name: "aliases.ui", description: <>Where UI components go (<code>@/components/ui</code>). Defaults to <code>components + &quot;/ui&quot;</code>.</> },
            { name: "aliases.lib", description: <>Library helpers (<code>@/lib</code>).</> },
            { name: "aliases.hooks", description: <>React hooks such as <code>use-ripple</code> (<code>@/hooks</code>).</> },
            { name: "aliases.utils", description: <>The module that exports <code>cn()</code> (<code>@/lib/utils</code>). Defaults to <code>lib + &quot;/utils&quot;</code>.</> },
            {
              name: "registry",
              description: (
                <>
                  Optional. Base URL of a remote registry; items are fetched from <code>&lt;url&gt;/&lt;name&gt;.json</code>.
                  Without it, the registry bundled with the installed CLI is used (works offline).
                </>
              ),
            },
          ]}
        />
        <Callout title="Aliases must resolve">
          The CLI writes files where your tsconfig <code>paths</code> point. Your bundler has to resolve the same alias.
          Next.js reads tsconfig automatically. In Vite, add <code>resolve.alias</code> (see{" "}
          <Link href="/docs/installation#vite">Installation</Link>).
        </Callout>
      </DocSection>

      <DocSection title="shadcn compatibility">
        <p>
          Every component is also published as a shadcn registry item, so projects that already use shadcn/ui can install
          with the shadcn CLI. Registry dependencies such as <code>use-ripple</code> are resolved automatically:
        </p>
        <CodeBlock className="mt-3" lang="bash" code={`npx shadcn@latest add ${siteConfig.registryUrl}/button.json`} />
        <p className="mt-3">
          shadcn uses your <code>components.json</code> aliases. You still need the theme tokens once, in your global CSS
          (or run <code>npx materializedcss init</code>, which never touches <code>components.json</code>):
        </p>
        <CodeBlock className="mt-3" lang="css" code={`@import "tailwindcss";\n@import "materializedcss/theme.css";`} />
        <p className="mt-3">
          The full index lives at <code>{siteConfig.registryUrl}/registry.json</code>. The materializedcss CLI can read it
          too: <code>npx materializedcss list --registry {siteConfig.registryUrl}</code>.
        </p>
        <Callout title="Coming from shadcn/ui?" tone="warning">
          materializedcss&apos;s <code>lib/utils.ts</code> also exports <code>composeEventHandlers</code> and{" "}
          <code>prefersReducedMotion</code>. If <code>init</code> keeps your existing utils file, it lists any missing
          exports so you can add them (or re-run with <code className="whitespace-nowrap">--force</code>).
        </Callout>
      </DocSection>

      <DocSection title="Package managers and CI">
        <p>
          The package manager comes from the lockfile in the project or a parent directory: <code>pnpm-lock.yaml</code>{" "}
          → pnpm, <code>yarn.lock</code> → yarn, <code>bun.lock</code>/<code>bun.lockb</code> → bun, otherwise the one
          that ran the CLI, then npm. Only packages missing from <code>package.json</code> are installed.
        </p>
        <p>
          For scripts and CI, combine <code>--yes</code> with <code>--skip-install</code> and install yourself. Commands
          exit with a non-zero code on failure and print what to do next.
        </p>
        <CodeBlock
          className="mt-3"
          lang="bash"
          code={`npx materializedcss init --yes --skip-install\nnpx materializedcss add --all --yes --skip-install\nnpm install`}
        />
      </DocSection>

      <PagerLinks prev={{ title: "Installation", href: "/docs/installation" }} next={{ title: "Theming", href: "/docs/theming" }} />
    </article>
  );
}
