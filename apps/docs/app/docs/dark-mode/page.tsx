import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { DocHeader, DocSection, PagerLinks } from "~/components/docs/doc-parts";

export const metadata: Metadata = { title: "Dark mode" };

export default function DarkModePage(): React.JSX.Element {
  return (
    <article data-doc-content>
      <DocHeader
        eyebrow="Getting Started"
        title="Dark mode"
        description="Materialize had no dark theme. Here every component supports one, driven by a single class."
      />

      <DocSection title="How it works">
        <p>
          The theme defines dark values for every token under a <code>.dark</code> class and registers Tailwind&apos;s{" "}
          <code>dark:</code> variant for the same selector. Put <code>class=&quot;dark&quot;</code> on{" "}
          <code>&lt;html&gt;</code> (or any container) and everything inside switches.
        </p>
        <CodeBlock className="mt-4" lang="css" code={`@custom-variant dark (&:where(.dark, .dark *));`} />
      </DocSection>

      <DocSection title="Next.js">
        <p>
          Use <a href="https://github.com/pacocoursey/next-themes">next-themes</a> to follow the system setting and
          remember the user&apos;s choice:
        </p>
        <CodeBlock className="mt-4" lang="bash" code="npm install next-themes" />
        <CodeBlock
          className="mt-3"
          title="app/layout.tsx"
          code={`import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`}
        />
        <CodeBlock
          className="mt-3"
          title="components/mode-toggle.tsx"
          code={`"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button variant="flat" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      Toggle theme
    </Button>
  );
}`}
        />
      </DocSection>

      <DocSection title="Vite and other frameworks">
        <p>Toggle the class yourself and persist the choice:</p>
        <CodeBlock
          className="mt-4"
          lang="ts"
          code={`const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const stored = localStorage.getItem("theme");
document.documentElement.classList.toggle("dark", stored ? stored === "dark" : prefersDark);`}
        />
      </DocSection>

      <DocSection title="Customizing dark colors">
        <CodeBlock
          lang="css"
          code={`.dark {
  --background: #0f1115;
  --surface: #171a21;
  --secondary: #80cbc4;
  --secondary-foreground: #002420;
}`}
        />
      </DocSection>
      <PagerLinks prev={{ title: "Theming", href: "/docs/theming" }} next={{ title: "Colors", href: "/docs/colors" }} />
    </article>
  );
}
