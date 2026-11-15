import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { RadioGroupControlled } from "~/registry/examples/radio-group-controlled";
import { RadioGroupDemo } from "~/registry/examples/radio-group-demo";
import { RadioGroupForm } from "~/registry/examples/radio-group-form";
import { RadioGroupHorizontal } from "~/registry/examples/radio-group-horizontal";
import { RadioGroupWithGap } from "~/registry/examples/radio-group-with-gap";

export const metadata: Metadata = { title: "Radio Group" };

export default function RadioGroupPage(): React.JSX.Element {
  return (
    <ComponentDoc name="radio-group">
      <ComponentPreview name="radio-group-demo">
        <RadioGroupDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="radio-group" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";`} />
        <CodeBlock
          className="mt-3"
          code={`<RadioGroup name="color" defaultValue="red" aria-label="Color">
  <RadioGroupItem value="red" label="Red" />
  <RadioGroupItem value="green" label="Green" />
</RadioGroup>`}
        />
      </DocSection>

      <DocSection title="With gap">
        <p>
          <code>variant=&quot;with-gap&quot;</code> keeps the ring and shows a smaller dot (Materialize{" "}
          <code>.with-gap</code>). Items can also take a <code>description</code>.
        </p>
        <ComponentPreview name="radio-group-with-gap">
          <RadioGroupWithGap />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Horizontal">
        <p>
          <code>orientation=&quot;horizontal&quot;</code> lays the items out in a row; arrow keys still move between them.
        </p>
        <ComponentPreview name="radio-group-horizontal">
          <RadioGroupHorizontal />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled">
        <ComponentPreview name="radio-group-controlled">
          <RadioGroupControlled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Forms">
        <p>
          Set <code>name</code> on the group; the selected <code>value</code> is submitted and <code>required</code> uses
          native validation.
        </p>
        <ComponentPreview name="radio-group-form">
          <RadioGroupForm />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="RadioGroup"
          props={[
            { name: "variant", type: '"default" | "with-gap"', default: '"default"', description: "Style of every item." },
            { name: "value / defaultValue", type: "string", description: "Controlled or initial selected value." },
            { name: "onValueChange", type: "(value: string) => void", description: "Called when the selection changes." },
            { name: "name", type: "string", description: "Form field name." },
            { name: "required / disabled", type: "boolean", default: "false", description: "Native form constraints." },
            { name: "orientation", type: '"vertical" | "horizontal"', default: "—", description: "Layout and arrow-key direction." },
            { name: "loop", type: "boolean", default: "true", description: "Arrow keys wrap around." },
          ]}
        />
        <PropsTable
          title="RadioGroupItem"
          props={[
            { name: "value", type: "string", description: "Value of this option (required)." },
            { name: "label", type: "ReactNode", description: "Visible label, linked with htmlFor." },
            { name: "description", type: "ReactNode", description: "Secondary text, linked with aria-describedby." },
            { name: "variant", type: '"default" | "with-gap"', description: "Override the group variant." },
            { name: "disabled", type: "boolean", default: "false", description: "Disable this option." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>The group has <code>role=&quot;radiogroup&quot;</code>; give it an <code>aria-label</code> or <code>aria-labelledby</code>.</li>
          <li><kbd>Tab</kbd> moves into the group (one tab stop); arrow keys move and select; <kbd>Space</kbd> selects the focused item.</li>
          <li>Disabled items are skipped by the arrow keys.</li>
          <li>Keyboard focus shows a halo around the circle.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
