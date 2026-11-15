import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { TooltipComposable } from "~/registry/examples/tooltip-composable";
import { TooltipDemo } from "~/registry/examples/tooltip-demo";

export const metadata: Metadata = { title: "Tooltip" };

export default function TooltipPage(): React.JSX.Element {
  return (
    <ComponentDoc name="tooltip">
      <ComponentPreview name="tooltip-demo">
        <TooltipDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="tooltip" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Tooltip } from "@/components/ui/tooltip";`} />
        <CodeBlock
          className="mt-3"
          code={`<Tooltip content="I am a tooltip" side="top">
  <Button>Hover me</Button>
</Tooltip>`}
        />
        <p>
          The child must be one element that accepts a ref and event handlers, such as a <code>Button</code>. The
          tooltip opens on hover, on keyboard focus and on a touch long-press. <code>content</code> is a React node, so
          markup you pass is rendered as React elements, never parsed as an HTML string.
        </p>
      </DocSection>

      <DocSection title="Composable parts">
        <p>
          For full control, use <code>TooltipRoot</code>, <code>TooltipTrigger</code> and <code>TooltipContent</code>.{" "}
          <code>TooltipProvider</code> is optional. It sets a shared open delay, and when the pointer moves from one
          trigger to the next within <code>skipDelayDuration</code>, the next tooltip opens without the delay. Users can
          move the pointer onto the tooltip without it closing.
        </p>
        <ComponentPreview name="tooltip-composable">
          <TooltipComposable />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Tooltip"
          props={[
            { name: "content", type: "ReactNode", description: "Tooltip content. Empty content renders only the child." },
            { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "Preferred placement. Flips when there is no room." },
            { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment along the side." },
            { name: "sideOffset", type: "number", default: "5", description: "Distance from the trigger (Materialize margin)." },
            { name: "enterDelay", type: "number", default: "0", description: "Delay before opening, in ms." },
            { name: "exitDelay", type: "number", default: "200", description: "Delay before closing after the pointer leaves, in ms." },
            { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Controlled or uncontrolled state." },
            { name: "contentClassName", type: "string", description: "Classes for the tooltip." },
          ]}
        />
        <PropsTable
          title="TooltipProvider"
          props={[
            { name: "delayDuration", type: "number", default: "0", description: "Default open delay for the tooltips inside." },
            { name: "skipDelayDuration", type: "number", default: "300", description: "Window in which the next tooltip opens instantly." },
            { name: "disableHoverableContent", type: "boolean", default: "false", description: "Close as soon as the pointer leaves the trigger." },
          ]}
        />
        <p>
          <code>TooltipRoot</code> takes the same state and delay props as <code>Tooltip</code>.{" "}
          <code>TooltipContent</code> takes <code>side</code>, <code>align</code>, <code>sideOffset</code>,{" "}
          <code>collisionPadding</code> and <code>className</code>.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            The content has <code>role=&quot;tooltip&quot;</code>, and the trigger points to it with{" "}
            <code>aria-describedby</code> while it is open.
          </li>
          <li>
            It opens on keyboard focus and closes on blur. <kbd>Escape</kbd> closes it right away.
          </li>
          <li>On touch screens, press and hold the trigger for half a second. The tooltip hides 1.5s after you let go.</li>
          <li>Tooltips only add a description. Icon-only triggers still need an <code>aria-label</code>.</li>
          <li>The slide is turned off when the user prefers reduced motion.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
