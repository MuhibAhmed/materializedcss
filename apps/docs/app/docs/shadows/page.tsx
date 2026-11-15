import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { DocHeader, DocSection, PagerLinks } from "~/components/docs/doc-parts";

export const metadata: Metadata = { title: "Shadows" };

const DEPTHS = [
  { cls: "shadow-none", label: "z-depth-0" },
  { cls: "shadow-z1", label: "z-depth-1" },
  { cls: "shadow-z1-half", label: "z-depth-1-half" },
  { cls: "shadow-z2", label: "z-depth-2" },
  { cls: "shadow-z3", label: "z-depth-3" },
  { cls: "shadow-z4", label: "z-depth-4" },
  { cls: "shadow-z5", label: "z-depth-5" },
];

export default function ShadowsPage(): React.JSX.Element {
  return (
    <article data-doc-content>
      <DocHeader
        eyebrow="Design System"
        title="Shadows"
        description="Material elevation: the exact z-depth shadows from Materialize, as Tailwind shadow utilities."
      />

      <DocSection title="Elevation">
        <div className="grid grid-cols-2 gap-8 rounded-md bg-surface-2 p-8 pb-16 sm:grid-cols-4">
          {DEPTHS.map((depth) => (
            <div key={depth.cls} className={`flex aspect-square flex-col items-center justify-center rounded-ui bg-surface text-center ${depth.cls}`}>
              <span className="font-mono text-sm text-foreground">{depth.cls}</span>
              <span className="mt-1 text-xs text-muted-foreground">{depth.label}</span>
            </div>
          ))}
          <div className="hoverable flex aspect-square flex-col items-center justify-center rounded-ui bg-surface text-center shadow-z1">
            <span className="font-mono text-sm text-foreground">hoverable</span>
            <span className="mt-1 text-xs text-muted-foreground">hover me</span>
          </div>
        </div>
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`<div className="shadow-z2">Card-like surface</div>
<div className="shadow-z1 hoverable">Lifts on hover</div>
<div className="shadow-z1 transition-shadow hover:shadow-z3">Custom transition</div>`}
        />
      </DocSection>
      <PagerLinks prev={{ title: "Typography", href: "/docs/typography" }} next={{ title: "Grid & helpers", href: "/docs/grid" }} />
    </article>
  );
}
