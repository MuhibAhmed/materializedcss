import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { DocHeader, DocSection } from "~/components/docs/doc-parts";

export const metadata: Metadata = { title: "Grid & helpers" };

const HELPERS: Array<[string, string]> = [
  [".container", "mx-auto w-[90%] max-w-[1280px] (or Tailwind's container)"],
  [".row / .col s12 m6 l4", "grid grid-cols-12 gap-6 / col-span-12 sm:col-span-6 lg:col-span-4"],
  [".offset-s2", "col-start-3"],
  [".valign-wrapper", "flex items-center"],
  [".center-align / .left-align / .right-align", "text-center / text-left / text-right"],
  [".left / .right", "float-left / float-right (or flex + ml-auto)"],
  [".hide-on-small-only", "max-sm:hidden"],
  [".hide-on-med-and-down", "max-lg:hidden"],
  [".show-on-large", "hidden lg:block"],
  [".truncate", "truncate"],
  [".hoverable", "hoverable (included in the theme)"],
  [".circle", "rounded-full"],
  [".responsive-img", "max-w-full h-auto"],
  [".z-depth-2", "shadow-z2"],
  [".flow-text", "flow-text (included in the theme)"],
  [".red.lighten-2 / .red-text", "bg-md-red-300 / text-md-red-500"],
];

export default function GridPage(): React.JSX.Element {
  return (
    <article data-doc-content>
      <DocHeader
        eyebrow="Design System"
        title="Grid & helpers"
        description="Materialize's 12-column grid and helper classes map directly onto Tailwind utilities."
      />

      <DocSection title="12-column grid">
        <p>
          Materialize used <code>.row</code> and <code>.col s12 m6 l4</code> with a 1.5rem gutter. Use Tailwind&apos;s grid
          with <code>gap-6</code>:
        </p>
        <div className="my-6 grid grid-cols-12 gap-6 text-center text-sm text-secondary-foreground">
          <div className="col-span-12 rounded-ui bg-secondary p-3">s12</div>
          {Array.from({ length: 2 }, (_, i) => (
            <div key={`m6-${i}`} className="col-span-12 rounded-ui bg-secondary p-3 sm:col-span-6">
              s12 m6
            </div>
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`l4-${i}`} className="col-span-12 rounded-ui bg-secondary p-3 sm:col-span-6 lg:col-span-4">
              s12 m6 l4
            </div>
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <div key={`one-${i}`} className="col-span-1 rounded-ui bg-secondary/80 py-3">
              1
            </div>
          ))}
        </div>
        <CodeBlock
          code={`<div className="grid grid-cols-12 gap-6">
  <div className="col-span-12 sm:col-span-6 lg:col-span-4">s12 m6 l4</div>
  <div className="col-span-12 sm:col-span-6 lg:col-span-4">s12 m6 l4</div>
  <div className="col-span-12 lg:col-span-4">s12 l4</div>
</div>`}
        />
      </DocSection>

      <DocSection title="Breakpoints">
        <p>
          Materialize breakpoints were 600px (small), 992px (medium) and 1200px (large). The components use Tailwind&apos;s
          defaults (<code>sm</code> 640, <code>md</code> 768, <code>lg</code> 1024, <code>xl</code> 1280). If you want
          Materialize&apos;s exact values, override them in your CSS:
        </p>
        <CodeBlock
          className="mt-4"
          lang="css"
          code={`@theme {
  --breakpoint-sm: 601px;
  --breakpoint-md: 993px;
  --breakpoint-lg: 1201px;
}`}
        />
      </DocSection>

      <DocSection title="Helper classes">
        <div tabIndex={0} role="region" aria-label="Reference table" className="overflow-x-auto rounded-md border border-border outline-none focus-visible:focus-ring">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Materialize</th>
                <th className="px-4 py-2.5 font-medium">Tailwind / materializedcss</th>
              </tr>
            </thead>
            <tbody>
              {HELPERS.map(([from, to]) => (
                <tr key={from} className="border-t border-border">
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] text-foreground">{from}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-secondary">{to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>
    </article>
  );
}
