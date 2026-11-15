import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { SwitchControlled } from "~/registry/examples/switch-controlled";
import { SwitchDemo } from "~/registry/examples/switch-demo";
import { SwitchDisabled } from "~/registry/examples/switch-disabled";
import { SwitchForm } from "~/registry/examples/switch-form";

export const metadata: Metadata = { title: "Switch" };

export default function SwitchPage(): React.JSX.Element {
  return (
    <ComponentDoc name="switch">
      <ComponentPreview name="switch-demo">
        <SwitchDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="switch" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Switch } from "@/components/ui/switch";`} />
        <CodeBlock className="mt-3" code={`<Switch label="Wi-Fi" offLabel="Off" onLabel="On" />`} />
      </DocSection>

      <DocSection title="Disabled">
        <ComponentPreview name="switch-disabled">
          <SwitchDisabled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled">
        <p>
          Use <code>checked</code> and <code>onCheckedChange</code>; changes made from outside are reflected immediately.
        </p>
        <ComponentPreview name="switch-controlled">
          <SwitchControlled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Forms">
        <p>
          With a <code>name</code>, the switch submits its <code>value</code> (default <code>&quot;on&quot;</code>) when
          checked, like a checkbox.
        </p>
        <ComponentPreview name="switch-form">
          <SwitchForm />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "checked / defaultChecked", type: "boolean", description: "Controlled or initial state." },
            { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called when the state changes." },
            { name: "label", type: "ReactNode", description: "Visible label and accessible name." },
            { name: "offLabel / onLabel", type: "ReactNode", description: "Decorative text on either side of the lever." },
            { name: "description", type: "ReactNode", description: "Secondary text, linked with aria-describedby." },
            { name: "name / value", type: "string", default: '— / "on"', description: "Submitted with the form when checked." },
            { name: "required / disabled", type: "boolean", default: "false", description: "Native form constraints." },
            { name: "containerClassName / labelClassName / thumbClassName", type: "string", description: "Classes for the parts. className goes on the track." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>Rendered as <code>role=&quot;switch&quot;</code> with <code>aria-checked</code>.</li>
          <li><kbd>Space</kbd> and <kbd>Enter</kbd> toggle it; clicking the label or the Off/On text toggles it too.</li>
          <li>
            The Off/On text is hidden from screen readers. Provide a <code>label</code>, or an <code>aria-label</code> when
            there is no visible label.
          </li>
          <li>Keyboard focus shows Materialize&apos;s halo around the thumb.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
