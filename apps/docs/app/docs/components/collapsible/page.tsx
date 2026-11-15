import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { CollapsibleControlled } from "~/registry/examples/collapsible-controlled";
import { CollapsibleDemo } from "~/registry/examples/collapsible-demo";
import { CollapsibleDisclosure } from "~/registry/examples/collapsible-disclosure";
import { CollapsibleExpandable } from "~/registry/examples/collapsible-expandable";
import { CollapsiblePopout } from "~/registry/examples/collapsible-popout";

export const metadata: Metadata = { title: "Collapsible" };

export default function CollapsiblePage(): React.JSX.Element {
  return (
    <ComponentDoc name="collapsible">
      <ComponentPreview name="collapsible-demo">
        <CollapsibleDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="collapsible" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { Collapsible, CollapsibleBody, CollapsibleHeader, CollapsibleItem } from "@/components/ui/collapsible";`}
        />
        <CodeBlock
          className="mt-3"
          code={`<Collapsible defaultValue="first">
  <CollapsibleItem value="first">
    <CollapsibleHeader icon={<MaterialIcon name="filter_drama" />}>First</CollapsibleHeader>
    <CollapsibleBody>Lorem ipsum dolor sit amet.</CollapsibleBody>
  </CollapsibleItem>
</Collapsible>`}
        />
      </DocSection>

      <DocSection title="Expandable">
        <p>
          With <code>type=&quot;multiple&quot;</code> (Materialize&apos;s <code>accordion: false</code>) any number of
          sections can be open at once. <code>value</code> and <code>defaultValue</code> are arrays.
        </p>
        <ComponentPreview name="collapsible-expandable">
          <CollapsibleExpandable />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Popout">
        <p>
          <code>variant=&quot;popout&quot;</code> floats each item as a card; the open one expands to full width and lifts.
        </p>
        <ComponentPreview name="collapsible-popout">
          <CollapsiblePopout />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled">
        <p>
          Control the open item with <code>value</code> and <code>onValueChange</code>, for example to build a stepper.
          By default the open item can be closed again; pass <code>collapsible=&#123;false&#125;</code> to keep one open.
        </p>
        <ComponentPreview name="collapsible-controlled">
          <CollapsibleControlled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Single section">
        <p>
          <code>CollapsibleSection</code> shows and hides one region with the same animation, without the list styling.
          Use <code>asChild</code> on the trigger to toggle from any button.
        </p>
        <ComponentPreview name="collapsible-disclosure">
          <CollapsibleDisclosure />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Collapsible"
          props={[
            {
              name: "type",
              type: '"single" | "multiple"',
              default: '"single"',
              description: "Accordion (one open item) or expandable (many).",
            },
            { name: "variant", type: '"default" | "popout"', default: '"default"', description: "Bordered list or floating popout items." },
            { name: "value", type: "string | string[]", description: "Controlled open item(s)." },
            { name: "defaultValue", type: "string | string[]", description: "Initially open item(s)." },
            { name: "onValueChange", type: "(value) => void", description: "Called when items open or close." },
            { name: "collapsible", type: "boolean", default: "true", description: "Single mode: allow closing the open item." },
            { name: "disabled", type: "boolean", default: "false", description: "Disable every item." },
          ]}
        />
        <PropsTable
          title="CollapsibleItem"
          props={[
            { name: "value", type: "string", description: "Unique id of the item." },
            { name: "disabled", type: "boolean", default: "false", description: "Prevent opening and closing the item." },
          ]}
        />
        <PropsTable
          title="CollapsibleHeader"
          props={[
            { name: "icon", type: "ReactNode", description: "Leading icon (decorative)." },
            { name: "chevron", type: "boolean", default: "true", description: "Show the rotating expand chevron." },
            { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "3", description: "Level of the heading wrapping the button." },
          ]}
        />
        <PropsTable
          title="CollapsibleBody"
          props={[
            { name: "innerClassName", type: "string", description: "Classes for the padded inner box." },
            { name: "forceMount", type: "true", description: "Keep the content mounted while closed." },
          ]}
        />
        <PropsTable
          title="CollapsibleSection"
          props={[
            { name: "open", type: "boolean", description: "Controlled open state." },
            { name: "defaultOpen", type: "boolean", default: "false", description: "Initial open state." },
            { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the section opens or closes." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <p>
          Follows the WAI-ARIA accordion pattern. Each header is a <code>&lt;button&gt;</code> inside a heading, with{" "}
          <code>aria-expanded</code> and <code>aria-controls</code> pointing to a labelled region.
        </p>
        <ul>
          <li>
            <kbd>Enter</kbd> / <kbd>Space</kbd> toggle the focused section.
          </li>
          <li>
            <kbd>ArrowDown</kbd> / <kbd>ArrowUp</kbd> move focus to the next or previous header.
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> move focus to the first or last header.
          </li>
          <li>Height animations are turned off when the user prefers reduced motion.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
