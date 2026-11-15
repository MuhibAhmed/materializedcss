import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "~/components/docs/code-block";
import { Callout, DocHeader, DocSection } from "~/components/docs/doc-parts";
import { getComponentNav } from "~/lib/registry";

export const metadata: Metadata = { title: "Introduction" };

const PRINCIPLES: Array<[string, string]> = [
  [
    "Same look, modern core",
    "Waves ripples, z-depth shadows, floating labels, the teal accent and the Materialize palette, now built on React 19, Tailwind CSS v4 and TypeScript.",
  ],
  [
    "You own the code",
    "Like shadcn/ui, the CLI copies each component's source into your project, so you can read it and change it. Prefer a dependency? Import the same components from the npm package.",
  ],
  [
    "Accessible by default",
    "Overlays, menus, selects, tabs and accordions use Radix primitives or WAI-ARIA patterns: focus trapping, focus return, keyboard navigation and screen reader labels.",
  ],
  [
    "Bugs fixed",
    "The iOS select bugs, dropdowns clipped inside modals, drifting tab indicators, stuck tooltips, XSS in toasts and tooltips, and leaking listeners are gone. Each component page lists what changed.",
  ],
  [
    "Themeable",
    "Semantic CSS variables, a built-in dark mode, reduced-motion support and a default palette that meets WCAG AA contrast.",
  ],
  [
    "No jQuery, no anime.js",
    "Animations use CSS and the Web Animations API, and nothing touches window during render, so it's SSR-safe.",
  ],
];

export default function IntroductionPage(): React.JSX.Element {
  const componentCount = getComponentNav().reduce((total, section) => total + section.items.length, 0);
  return (
    <article data-doc-content>
      <DocHeader
        eyebrow="Getting Started"
        title="Introduction"
        description="Materialize's Material Design components, rebuilt for React 19, Tailwind CSS v4 and TypeScript, and distributed the shadcn way."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {PRINCIPLES.map(([title, text]) => (
          <div key={title} className="rounded-md border border-border bg-surface p-5 shadow-z1">
            <p className="mb-1 font-medium text-foreground">{title}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>

      <DocSection title="Quick start" className="mt-12">
        <p>In an existing React project with Tailwind CSS v4:</p>
        <CodeBlock className="mt-4" lang="bash" code={`npx materializedcss init\nnpx materializedcss add button card modal`} />
        <CodeBlock
          className="mt-3"
          code={`import { Button } from "@/components/ui/button";

export default function Page() {
  return <Button>Hello Material</Button>;
}`}
        />
        <p className="mt-4">
          See <Link href="/docs/installation">Installation</Link> for Next.js, Vite and npm-package setups, and{" "}
          <Link href="/docs/cli">CLI</Link> for every command.
        </p>
      </DocSection>

      <DocSection title="What's included">
        <p>
          {componentCount} documented components and primitives covering everything Materialize shipped: buttons, cards,
          collections, forms (text fields, selects, autocomplete, chips, pickers), navigation (navbar, sidenav, tabs,
          breadcrumbs, pagination), overlays (modal, dropdown, tooltip, toast, feature discovery) and motion (carousel,
          slider, parallax, pushpin, scrollspy).
        </p>
        <Callout title="Credits">
          The design comes from <a href="https://materializecss.com">Materialize</a> by Alvin Wang, Alan Chang, Alex Mark
          and Kevin Louie (MIT). This project is an independent reimplementation.
        </Callout>
      </DocSection>
    </article>
  );
}
