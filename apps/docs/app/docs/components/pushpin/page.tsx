import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { PushpinDemo } from "~/registry/examples/pushpin-demo";

export const metadata: Metadata = { title: "Pushpin" };

export default function PushpinPage(): React.JSX.Element {
  return (
    <ComponentDoc name="pushpin">
      <ComponentPreview name="pushpin-demo">
        <PushpinDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="pushpin" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Pushpin } from "@/components/ui/pushpin";`} />
        <CodeBlock
          className="mt-3"
          code={`<div className="grid grid-cols-[1fr_240px] gap-8">
  <article>…</article>
  <aside>
    <Pushpin top={80} onPinChange={(state) => console.log(state)}>
      <TableOfContents items={items} />
    </Pushpin>
  </aside>
</div>`}
        />
      </DocSection>

      <DocSection title="Boundaries">
        <p>
          Materialize&apos;s pushpin took <code>top</code> and <code>bottom</code> scroll positions in pixels, which broke
          whenever content above changed height. Here the boundaries come from the layout:
        </p>
        <ul>
          <li>
            <strong>Top boundary</strong>: the element&apos;s own position. It pins when it reaches <code>top</code> px
            from the top of the viewport or scroll container (<code>pin-top</code> → <code>pinned</code>).
          </li>
          <li>
            <strong>Bottom boundary</strong>: the end of its parent. Make the parent span the section the element should
            follow (a grid or flex column stretches by default); the element is released when the parent ends (
            <code>pinned</code> → <code>pin-bottom</code>).
          </li>
          <li>
            Sticky positioning is relative to the nearest scrolling or <code>overflow: hidden</code> ancestor. Avoid such
            ancestors between the pushpin and the page if you want it to follow the page scroll.
          </li>
        </ul>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "top", type: "number", default: "0", description: "Distance from the top of the scroll container while pinned (px)." },
            {
              name: "onPinChange",
              type: '(state: "pin-top" | "pinned" | "pin-bottom") => void',
              description: "Called when the state changes.",
            },
          ]}
        />
        <p>
          The current state is also exposed as <code>data-state</code>, so you can style it with{" "}
          <code>data-[state=pinned]:shadow-z2</code>.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>Pinning does not change the reading or focus order: the element stays in its place in the document.</li>
          <li>Keep pinned content short so it does not cover the content being read on small screens.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
