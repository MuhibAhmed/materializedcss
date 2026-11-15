import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "~/components/docs/code-block";
import { Callout, DocHeader, DocSection, DocSubheading, PagerLinks } from "~/components/docs/doc-parts";
import { SimpleTabs } from "~/components/docs/simple-tabs";

export const metadata: Metadata = {
  title: "Installation",
  description: "Set up materializedcss in a Next.js, Vite or any React 19 + Tailwind CSS v4 project, with the CLI or the npm package.",
};

const nextFont = `import { Roboto } from "next/font/google";

import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={roboto.variable}>
      <head>
        {/* Only needed if you use <MaterialIcon name="..." /> */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </head>
      <body>{children}</body>
    </html>
  );
}`;

const fontLinks = `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
/>
<!-- Only needed if you use <MaterialIcon name="..." /> -->
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />`;

const viteConfig = `import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
});`;

const viteTsconfig = `{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}`;

const usage = `import { Button } from "@/components/ui/button";

export default function Page() {
  return <Button>Click me</Button>;
}`;

const npmUsage = `import { Button } from "materializedcss";
// or deep-import a single component:
import { Card, CardContent } from "materializedcss/card";

export function Example() {
  return <Button variant="flat">Click me</Button>;
}`;

const manualCss = `@import "tailwindcss";
@import "./materializedcss-theme.css"; /* copied from materializedcss/dist/theme.css */`;

export default function InstallationPage(): React.JSX.Element {
  return (
    <article data-doc-content>
      <DocHeader
        eyebrow="Getting Started"
        title="Installation"
        description="Add materializedcss to a React 19 + Tailwind CSS v4 project. Copy the components into your code with the CLI, or import them from the npm package."
      />

      <DocSection title="Requirements">
        <ul>
          <li>
            <strong>React 19</strong> (components take <code>ref</code> as a regular prop, no <code>forwardRef</code>).
          </li>
          <li>
            <strong>Tailwind CSS v4</strong>, set up the CSS-first way: your global stylesheet starts with{" "}
            <code>@import &quot;tailwindcss&quot;;</code>. Tailwind v3 projects can upgrade with{" "}
            <code>npx @tailwindcss/upgrade</code>.
          </li>
          <li>
            <strong>TypeScript</strong> is recommended. The CLI copies <code>.tsx</code> files and reads the{" "}
            <code>paths</code> alias (usually <code>@/*</code>) from <code>tsconfig.json</code> or{" "}
            <code>jsconfig.json</code>.
          </li>
          <li>Node.js 22 or newer to run the CLI.</li>
        </ul>
      </DocSection>

      <DocSection title="Choose how to install">
        <p>
          Both modes use the same components, theme tokens and class names, so you can start with one and switch later.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-surface p-5 shadow-z1">
            <p className="mb-1 font-medium text-foreground">CLI (recommended)</p>
            <p className="text-sm">
              <code>npx materializedcss add button</code> copies the source into <code>components/ui</code>. You own the
              code: change markup, variants and behavior freely. Like shadcn/ui.
            </p>
          </div>
          <div className="rounded-md border border-border bg-surface p-5 shadow-z1">
            <p className="mb-1 font-medium text-foreground">npm package</p>
            <p className="text-sm">
              <code>npm install materializedcss</code> and import components from the package. Updates arrive with a
              version bump; customize through props, <code>className</code> and the theme.
            </p>
          </div>
        </div>
      </DocSection>

      <DocSection title="Next.js">
        <DocSubheading>1. Create a project</DocSubheading>
        <p>
          <code>create-next-app</code> sets up Tailwind CSS v4, TypeScript and the <code>@/*</code> alias for you.
        </p>
        <CodeBlock lang="bash" code="npx create-next-app@latest my-app --typescript --tailwind --app --src-dir" />

        <DocSubheading>2. Run init</DocSubheading>
        <p>
          The CLI detects Next.js and the App Router (so <code>&quot;use client&quot;</code> directives are kept), finds{" "}
          <code>app/globals.css</code>, and asks where to put components.
        </p>
        <CodeBlock lang="bash" code="npx materializedcss@latest init" />
        <p className="mt-3">It writes four things:</p>
        <ul>
          <li>
            <code>materialized.json</code> with your aliases (see the <Link href="/docs/cli">CLI reference</Link>).
          </li>
          <li>
            <code>lib/utils.ts</code> with the <code>cn()</code> helper.
          </li>
          <li>
            <code>@import &quot;materializedcss/theme.css&quot;;</code> right after <code>@import &quot;tailwindcss&quot;;</code>{" "}
            in your global CSS.
          </li>
          <li>
            The dependencies <code>clsx</code>, <code>tailwind-merge</code>, <code>class-variance-authority</code> and{" "}
            <code>materializedcss</code> (for the theme file).
          </li>
        </ul>
        <CodeBlock
          className="mt-4"
          title="src/app/globals.css"
          lang="css"
          code={`@import "tailwindcss";\n@import "materializedcss/theme.css";`}
        />

        <DocSubheading>3. Add components</DocSubheading>
        <CodeBlock lang="bash" code="npx materializedcss add button card text-field" />
        <CodeBlock className="mt-3" title="src/app/page.tsx" code={usage} />
      </DocSection>

      <DocSection title="Vite">
        <DocSubheading>1. Create a React + TypeScript project and add Tailwind CSS</DocSubheading>
        <CodeBlock
          lang="bash"
          code={`npm create vite@latest my-app -- --template react-ts\ncd my-app\nnpm install tailwindcss @tailwindcss/vite\nnpm install -D @types/node`}
        />
        <CodeBlock className="mt-3" title="src/index.css" lang="css" code={`@import "tailwindcss";`} />

        <DocSubheading>2. Configure the @ alias</DocSubheading>
        <p>
          Vite&apos;s template splits TypeScript settings across files. Add <code>paths</code> to both{" "}
          <code>tsconfig.json</code> and <code>tsconfig.app.json</code> (the CLI reads either), and teach Vite the same
          alias.
        </p>
        <CodeBlock className="mt-3" title="tsconfig.json" lang="json" code={viteTsconfig} />
        <CodeBlock className="mt-3" title="vite.config.ts" lang="ts" code={viteConfig} />

        <DocSubheading>3. Run init and add components</DocSubheading>
        <p>
          Vite apps don&apos;t use React Server Components, so the CLI removes the <code>&quot;use client&quot;</code>{" "}
          directives from the files it copies.
        </p>
        <CodeBlock lang="bash" code={`npx materializedcss@latest init\nnpx materializedcss add button`} />
      </DocSection>

      <DocSection title="Other frameworks">
        <p>
          React Router, Astro and any other React 19 setup work the same way: make sure Tailwind CSS v4 is installed and
          your global stylesheet has <code>@import &quot;tailwindcss&quot;;</code>, then run <code>init</code>. Pass{" "}
          <code>--css path/to/global.css</code> if the CLI can&apos;t find your stylesheet, and <code>--no-rsc</code> or{" "}
          <code>--rsc</code> to override Server Components detection.
        </p>
        <CodeBlock className="mt-3" lang="bash" code="npx materializedcss@latest init --css app/app.css" />
      </DocSection>

      <DocSection title="npm package">
        <p>Skip the CLI and use the precompiled components. Tailwind CSS v4 is still required.</p>
        <CodeBlock lang="bash" code="npm install materializedcss" />
        <p className="mt-3">
          Import <code>styles.css</code> after Tailwind. It contains the theme tokens and an <code>@source</code> rule so
          Tailwind generates the classes used inside the package.
        </p>
        <CodeBlock className="mt-3" title="app/globals.css" lang="css" code={`@import "tailwindcss";\n@import "materializedcss/styles.css";`} />
        <CodeBlock className="mt-3" code={npmUsage} />
        <Callout title="Server Components">
          Interactive components ship with their <code>&quot;use client&quot;</code> directive preserved, so you can render
          them directly from Server Components in the Next.js App Router.
        </Callout>
      </DocSection>

      <DocSection title="Manual">
        <p>Prefer no tooling at all? Every component page has a Manual tab with the full source. You also need:</p>
        <SimpleTabs
          label="Manual setup files"
          className="my-4"
          tabs={[
            {
              value: "deps",
              label: "Dependencies",
              content: <CodeBlock lang="bash" code="npm install clsx tailwind-merge class-variance-authority" />,
            },
            {
              value: "css",
              label: "Theme",
              content: (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Copy <code>theme.css</code> from the package (or run <code>init --copy-theme</code>) next to your
                    stylesheet and import it:
                  </p>
                  <CodeBlock title="globals.css" lang="css" code={manualCss} />
                </div>
              ),
            },
            {
              value: "alias",
              label: "Alias",
              content: (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Components import <code>@/lib/utils</code>, <code>@/hooks/*</code> and{" "}
                    <code>@/components/ui/*</code>:
                  </p>
                  <CodeBlock title="tsconfig.json" lang="json" code={`{\n  "compilerOptions": {\n    "paths": { "@/*": ["./src/*"] }\n  }\n}`} />
                </div>
              ),
            },
          ]}
        />
      </DocSection>

      <DocSection title="Fonts">
        <p>
          Materialize is designed around <strong>Roboto</strong>. The components don&apos;t bundle fonts, so load it the way
          your framework prefers. The <strong>Material Icons</strong> font is optional: components use inline SVG icons,
          and only the <code>&lt;MaterialIcon name=&quot;...&quot; /&gt;</code> helper needs it.
        </p>
        <SimpleTabs
          label="Font loading"
          className="my-4"
          tabs={[
            {
              value: "next",
              label: "Next.js",
              content: (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    The theme&apos;s <code>font-sans</code> already reads the <code>--font-roboto</code> variable that{" "}
                    <code>next/font</code> defines, so there is nothing to add to your CSS.
                  </p>
                  <CodeBlock title="app/layout.tsx" code={nextFont} />
                </div>
              ),
            },
            {
              value: "html",
              label: "HTML (Vite, others)",
              content: <CodeBlock title="index.html" lang="tsx" code={fontLinks} />,
            },
          ]}
        />
      </DocSection>

      <DocSection title="Next steps">
        <ul>
          <li>
            Every command and flag: <Link href="/docs/cli">CLI</Link>.
          </li>
          <li>
            Colors, radius and elevation tokens: <Link href="/docs/theming">Theming</Link> and{" "}
            <Link href="/docs/dark-mode">Dark mode</Link>.
          </li>
          <li>
            Browse the components, starting with <Link href="/docs/components/button">Button</Link>.
          </li>
        </ul>
      </DocSection>

      <PagerLinks prev={{ title: "Introduction", href: "/docs" }} next={{ title: "CLI", href: "/docs/cli" }} />
    </article>
  );
}
