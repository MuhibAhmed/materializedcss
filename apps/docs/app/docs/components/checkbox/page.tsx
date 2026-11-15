import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { CheckboxDemo } from "~/registry/examples/checkbox-demo";
import { CheckboxDescription } from "~/registry/examples/checkbox-description";
import { CheckboxFilledIn } from "~/registry/examples/checkbox-filled-in";
import { CheckboxForm } from "~/registry/examples/checkbox-form";
import { CheckboxIndeterminate } from "~/registry/examples/checkbox-indeterminate";

export const metadata: Metadata = { title: "Checkbox" };

export default function CheckboxPage(): React.JSX.Element {
  return (
    <ComponentDoc name="checkbox">
      <ComponentPreview name="checkbox-demo">
        <CheckboxDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="checkbox" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Checkbox } from "@/components/ui/checkbox";`} />
        <CodeBlock className="mt-3" code={`<Checkbox label="Remember me" name="remember" />`} />
      </DocSection>

      <DocSection title="Filled in">
        <p>
          <code>variant=&quot;filled-in&quot;</code> fills the box with the secondary color and draws a white tick, like
          Materialize&apos;s <code>.filled-in</code>.
        </p>
        <ComponentPreview name="checkbox-filled-in">
          <CheckboxFilledIn />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Indeterminate">
        <p>
          Pass <code>&quot;indeterminate&quot;</code> as <code>checked</code> for a parent checkbox whose children are
          partly selected. It is announced as <code>aria-checked=&quot;mixed&quot;</code>.
        </p>
        <ComponentPreview name="checkbox-indeterminate">
          <CheckboxIndeterminate />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Description">
        <p>
          <code>description</code> adds secondary text that is linked with <code>aria-describedby</code>.
        </p>
        <ComponentPreview name="checkbox-description">
          <CheckboxDescription />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Forms">
        <p>
          Inside a <code>&lt;form&gt;</code> a hidden native checkbox is rendered, so <code>name</code>, <code>value</code>{" "}
          and <code>required</code> behave like a regular input.
        </p>
        <ComponentPreview name="checkbox-form">
          <CheckboxForm />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "variant", type: '"default" | "filled-in"', default: '"default"', description: "Morphing tick or filled box." },
            { name: "checked", type: 'boolean | "indeterminate"', description: "Controlled state." },
            { name: "defaultChecked", type: 'boolean | "indeterminate"', description: "Initial state when uncontrolled." },
            { name: "onCheckedChange", type: '(checked: boolean | "indeterminate") => void', description: "Called when the state changes." },
            { name: "label", type: "ReactNode", description: "Visible label, linked with htmlFor." },
            { name: "description", type: "ReactNode", description: "Secondary text, linked with aria-describedby." },
            { name: "name / value", type: "string", default: '— / "on"', description: "Submitted with the form when checked." },
            { name: "required / disabled", type: "boolean", default: "false", description: "Native form constraints." },
            { name: "containerClassName / labelClassName", type: "string", description: "Classes for the wrapper and label. className goes on the box." },
          ]}
        />
        <p>All other Radix Checkbox and <code>&lt;button&gt;</code> props are forwarded.</p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>Rendered as <code>role=&quot;checkbox&quot;</code> with <code>aria-checked</code> (<code>mixed</code> when indeterminate).</li>
          <li><kbd>Space</kbd> toggles the focused checkbox; clicking the label toggles it too.</li>
          <li>Keyboard focus shows a halo around the box.</li>
          <li>Without a <code>label</code>, pass <code>aria-label</code> or <code>aria-labelledby</code>.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
