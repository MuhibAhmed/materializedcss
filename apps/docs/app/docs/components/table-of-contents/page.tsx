import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { TableOfContentsDemo } from "~/registry/examples/table-of-contents-demo";
import { TableOfContentsHook } from "~/registry/examples/table-of-contents-hook";

export const metadata: Metadata = { title: "Table of Contents" };

export default function TableOfContentsPage(): React.JSX.Element {
  return (
    <ComponentDoc name="table-of-contents">
      <ComponentPreview name="table-of-contents-demo" align="start">
        <TableOfContentsDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="table-of-contents" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { TableOfContents } from "@/components/ui/table-of-contents";`} />
        <CodeBlock
          className="mt-3"
          code={`<section id="introduction" className="scroll-mt-24">…</section>
<section id="structure" className="scroll-mt-24">…</section>

<Pushpin top={88}>
  <TableOfContents
    items={[
      { id: "introduction", label: "Introduction" },
      { id: "structure", label: "Structure" },
    ]}
  />
</Pushpin>`}
        />
        <p>
          A section becomes active once its top scrolls above <code>scrollOffset</code> px from the top of the viewport (200
          by default, like Materialize). Links scroll with <code>scrollIntoView</code>, so give the page a{" "}
          <code>scroll-padding-top</code> or the sections a <code>scroll-margin-top</code> (<code>scroll-mt-24</code>) so
          a sticky header does not cover them after a link is clicked.
        </p>
      </DocSection>

      <DocSection title="useScrollSpy">
        <p>
          The scroll tracking is a separate hook. It returns the active id, so you can build any navigation with it, and
          takes a <code>root</code> to track sections inside a scrolling element.
        </p>
        <ComponentPreview name="table-of-contents-hook">
          <TableOfContentsHook />
        </ComponentPreview>
        <CodeBlock
          code={`import { useScrollSpy } from "@/hooks/use-scroll-spy";

const active = useScrollSpy(["plan", "build", "test"], { scrollOffset: 48, root });`}
        />
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="TableOfContents"
          props={[
            {
              name: "items",
              type: "{ id: string; label: ReactNode; level?: 1 | 2 | 3 }[]",
              description: "Sections to link to, in document order. level indents nested sections.",
            },
            { name: "scrollOffset", type: "number", default: "200", description: "Activation line, in px from the top of the scroller." },
            { name: "root", type: "Element | null", default: "null", description: "Scrolling element containing the sections (default: the page)." },
            { name: "onActiveChange", type: "(id: string | null) => void", description: "Called when the active section changes." },
            { name: "aria-label", type: "string", default: '"Table of contents"', description: "Accessible name of the navigation landmark." },
          ]}
        />
        <PropsTable
          title="useScrollSpy(ids, options)"
          props={[
            { name: "ids", type: "readonly string[]", description: "Ids of the sections to track, in document order." },
            { name: "options.scrollOffset", type: "number", default: "200", description: "Activation line, in px from the top of the scroller." },
            { name: "options.root", type: "Element | null", default: "null", description: "Scrolling element (default: the viewport)." },
            { name: "returns", type: "string | null", description: "Id of the last section above the line, or null before the first one." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            The list is a <code>nav</code> landmark; give it a distinct <code>aria-label</code> when the page has several.
          </li>
          <li>
            The active link has <code>aria-current=&quot;location&quot;</code>.
          </li>
          <li>
            Activating a link moves focus to the section, so keyboard and screen reader users continue reading from there.
          </li>
          <li>Smooth scrolling is turned off when the user prefers reduced motion.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
