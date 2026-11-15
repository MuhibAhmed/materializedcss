import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { DocHeader, DocSection, PagerLinks } from "~/components/docs/doc-parts";

export const metadata: Metadata = { title: "Typography" };

const HEADINGS = [
  { cls: "text-h1", label: "Heading 1", size: "4.2rem" },
  { cls: "text-h2", label: "Heading 2", size: "3.56rem" },
  { cls: "text-h3", label: "Heading 3", size: "2.92rem" },
  { cls: "text-h4", label: "Heading 4", size: "2.28rem" },
  { cls: "text-h5", label: "Heading 5", size: "1.64rem" },
  { cls: "text-h6", label: "Heading 6", size: "1.15rem" },
];

export default function TypographyPage(): React.JSX.Element {
  return (
    <article data-doc-content>
      <DocHeader
        eyebrow="Design System"
        title="Typography"
        description="Roboto, Materialize's heading scale and the responsive flow-text utility."
      />

      <DocSection title="Font">
        <p>
          The theme sets <code>font-sans</code> to Roboto (read from the <code>--font-roboto</code> variable when you load
          it with <code>next/font</code>) with a system fallback stack. Load the 300, 400, 500 and 700 weights.
        </p>
        <CodeBlock
          className="mt-4"
          title="app/layout.tsx"
          code={`import { Roboto } from "next/font/google";

const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"], variable: "--font-roboto" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}`}
        />
      </DocSection>

      <DocSection title="Headings">
        <div className="space-y-4 overflow-hidden rounded-md border border-border p-6">
          {HEADINGS.map((heading) => (
            <div
              key={heading.cls}
              className="flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <p className={`${heading.cls} min-w-0 font-normal text-foreground sm:truncate`}>{heading.label}</p>
              <code className="shrink-0 text-xs">
                {heading.cls} · {heading.size}
              </code>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="Flow text">
        <p>
          <code>flow-text</code> scales smoothly with the viewport, like Materialize&apos;s <code>.flow-text</code>, but
          with a single <code>clamp()</code> instead of twenty media queries.
        </p>
        <p className="flow-text mt-4 rounded-md border border-border p-6 !text-foreground">
          Material is the metaphor. A material metaphor is the unifying theory of a rationalized space and a system of
          motion.
        </p>
      </DocSection>

      <DocSection title="Weights">
        <div className="space-y-2 rounded-md border border-border p-6 text-2xl text-foreground">
          <p className="font-light">Light 300: the default for titles and flow text</p>
          <p className="font-normal">Regular 400: body copy</p>
          <p className="font-medium">Medium 500: buttons, tabs, emphasis</p>
          <p className="font-bold">Bold 700</p>
        </div>
      </DocSection>
      <PagerLinks prev={{ title: "Colors", href: "/docs/colors" }} next={{ title: "Shadows", href: "/docs/shadows" }} />
    </article>
  );
}
