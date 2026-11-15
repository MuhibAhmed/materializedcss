import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { DocHeader, DocSection, PagerLinks } from "~/components/docs/doc-parts";
import { PaletteGrid } from "~/components/palette-grid";

export const metadata: Metadata = { title: "Colors" };

export default function ColorsPage(): React.JSX.Element {
  return (
    <article data-doc-content>
      <DocHeader
        eyebrow="Design System"
        title="Colors"
        description="The complete Material Design palette from Materialize, as Tailwind utilities. Click a swatch to copy its class."
      />

      <DocSection title="Usage">
        <p>
          Materialize used class pairs like <code>red lighten-2</code> and <code>red-text text-darken-4</code>. Here every
          shade is a regular Tailwind color in the <code>md</code> namespace, so it works with any color utility, variant
          and opacity modifier:
        </p>
        <CodeBlock
          className="mt-4"
          code={`<div className="bg-md-teal-500 text-white" />        {/* teal */}
<p className="text-md-red-900">…</p>                  {/* red-text text-darken-4 */}
<div className="border-md-indigo-a200 hover:bg-md-indigo-50/60" />`}
        />
      </DocSection>

      <DocSection title="Shade mapping">
        <p>
          <code>lighten-5…1</code> map to <code>50…400</code>, the base color is <code>500</code>, <code>darken-1…4</code>{" "}
          map to <code>600…900</code> and <code>accent-1…4</code> map to <code>a100</code>, <code>a200</code>,{" "}
          <code>a400</code> and <code>a700</code>. Brown, grey and blue-grey have no accents.
        </p>
      </DocSection>

      <DocSection title="Palette">
        <PaletteGrid />
      </DocSection>
      <PagerLinks prev={{ title: "Dark mode", href: "/docs/dark-mode" }} next={{ title: "Typography", href: "/docs/typography" }} />
    </article>
  );
}
