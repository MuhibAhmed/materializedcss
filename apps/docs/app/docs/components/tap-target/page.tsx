import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { TapTargetDemo } from "~/registry/examples/tap-target-demo";

export const metadata: Metadata = { title: "Tap Target" };

export default function TapTargetPage(): React.JSX.Element {
  return (
    <ComponentDoc name="tap-target">
      <ComponentPreview name="tap-target-demo">
        <TapTargetDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="tap-target" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import {
  TapTarget, TapTargetAnchor, TapTargetContent,
  TapTargetTitle, TapTargetDescription,
} from "@/components/ui/tap-target";`}
        />
        <CodeBlock
          className="mt-3"
          code={`const [open, setOpen] = React.useState(false);

<TapTarget open={open} onOpenChange={setOpen}>
  <TapTargetAnchor>
    <Button variant="floating" aria-label="Add item"><AddIcon /></Button>
  </TapTargetAnchor>
  <TapTargetContent>
    <TapTargetTitle>Add new items</TapTargetTitle>
    <TapTargetDescription>Use the plus button to start a list item.</TapTargetDescription>
  </TapTargetContent>
</TapTarget>`}
        />
        <p>
          <code>TapTargetAnchor</code> marks the feature being introduced without adding a wrapper element. If the
          target lives somewhere else in your tree, pass <code>targetRef</code> to <code>TapTarget</code> instead.
        </p>
      </DocSection>

      <DocSection title="Placement">
        <p>
          The circle is centered on the target. Like Materialize, the text goes in the quarter of the circle that faces
          the middle of the screen, and spans the full width when the target is near the horizontal center. Unlike
          Materialize, the text is kept at least 16px inside the viewport, so it stays readable on small screens. The
          circle follows its target when the page scrolls or resizes.
        </p>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="TapTarget"
          props={[
            { name: "open / defaultOpen", type: "boolean", description: "Controlled / initial open state." },
            { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when it opens or closes." },
            { name: "targetRef", type: "RefObject<HTMLElement>", description: "The highlighted element, when you don't use TapTargetAnchor." },
          ]}
        />
        <PropsTable
          title="TapTargetContent"
          props={[
            { name: "size", type: "number", default: "800", description: "Circle diameter in px." },
            { name: "circleClassName", type: "string", description: "Classes for the circle, such as bg-secondary." },
            { name: "className", type: "string", description: "Classes for the dialog wrapper." },
          ]}
        />
        <p>
          <code>TapTargetTitle</code> renders an <code>h2</code> and <code>TapTargetDescription</code> renders a{" "}
          <code>p</code>. Both are wired to the dialog&apos;s <code>aria-labelledby</code> and{" "}
          <code>aria-describedby</code>.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            The content is a <code>role=&quot;dialog&quot;</code> named by its title and described by its description.
          </li>
          <li>
            Focus moves to the dialog when it opens, so screen readers announce it, and returns to the previously focused
            element when it closes.
          </li>
          <li>
            <kbd>Escape</kbd>, a click outside the circle, or a click on the highlighted target closes it. Consider a
            &quot;Got it&quot; button, as in the demo, for a visible way out.
          </li>
          <li>The circle transition and the pulse are turned off when the user prefers reduced motion.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
