import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { TextFieldCounter } from "~/registry/examples/text-field-counter";
import { TextFieldDemo } from "~/registry/examples/text-field-demo";
import { TextFieldForm } from "~/registry/examples/text-field-form";
import { TextFieldHelper } from "~/registry/examples/text-field-helper";
import { TextFieldOutlined } from "~/registry/examples/text-field-outlined";
import { TextFieldPrefilled } from "~/registry/examples/text-field-prefilled";
import { TextFieldPrefix } from "~/registry/examples/text-field-prefix";

export const metadata: Metadata = { title: "Text Field" };

export default function TextFieldPage(): React.JSX.Element {
  return (
    <ComponentDoc name="text-field">
      <ComponentPreview name="text-field-demo">
        <TextFieldDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="text-field" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { TextField } from "@/components/ui/text-field";`} />
        <CodeBlock className="mt-3" code={`<TextField label="Email" type="email" name="email" />`} />
      </DocSection>

      <DocSection title="Prefix icons">
        <p>A leading icon turns the secondary color while the field has focus.</p>
        <ComponentPreview name="text-field-prefix">
          <TextFieldPrefix />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Helper and error text">
        <p>
          <code>helperText</code> sits under the field. Pass a message to <code>error</code> to replace it: the field gets{" "}
          <code>aria-invalid</code> and the message is announced. <code>success</code> shows the valid state.
        </p>
        <ComponentPreview name="text-field-helper">
          <TextFieldHelper />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Character counter">
        <p>
          <code>showCount</code> with <code>maxLength</code> shows <code>n/max</code>. Set{" "}
          <code>enforceMaxLength=&#123;false&#125;</code> for Materialize&apos;s soft limit, where the counter turns red
          instead of blocking input.
        </p>
        <ComponentPreview name="text-field-counter">
          <TextFieldCounter />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Outlined">
        <ComponentPreview name="text-field-outlined">
          <TextFieldOutlined />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Prefilled and programmatic values">
        <p>
          The label floats with CSS only, so values set from state, by the browser&apos;s autofill or by a placeholder
          never overlap it. There is no <code>M.updateTextFields()</code> to call.
        </p>
        <ComponentPreview name="text-field-prefilled">
          <TextFieldPrefilled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Forms">
        <p>It is a native input, so <code>name</code>, <code>required</code>, constraint validation and reset just work.</p>
        <ComponentPreview name="text-field-form">
          <TextFieldForm />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="TextField"
          props={[
            { name: "label", type: "ReactNode", description: "Floating label." },
            { name: "helperText", type: "ReactNode", description: "Text under the field." },
            { name: "error", type: "ReactNode | boolean", description: "true or a message. Sets aria-invalid; a message replaces the helper text." },
            { name: "success", type: "boolean", default: "false", description: "Valid (green) state." },
            { name: "validate", type: "boolean", default: "false", description: "Color from native validation after interaction (:user-invalid)." },
            { name: "prefix", type: "ReactNode", description: "Leading icon." },
            { name: "suffix", type: "ReactNode", description: "Trailing icon or button." },
            { name: "variant", type: '"standard" | "outlined"', default: '"standard"', description: "Underline or outlined box." },
            { name: "showCount", type: "boolean", default: "false", description: "Show the n/maxLength counter." },
            { name: "enforceMaxLength", type: "boolean", default: "true", description: "Set native maxlength. false allows typing past the limit." },
            { name: "fullWidth", type: "boolean", default: "true", description: "Stretch to the container width." },
            { name: "inputClassName / labelClassName", type: "string", description: "Classes for the input and label. className goes on the wrapper." },
          ]}
        />
        <p>
          All other <code>&lt;input&gt;</code> props (<code>name</code>, <code>type</code>, <code>value</code>,{" "}
          <code>required</code>, <code>ref</code>, <code>aria-*</code>...) go to the input. Lower-level parts are exported
          too: <code>Input</code>, <code>TextFieldRoot</code>, <code>TextFieldLabel</code>, <code>TextFieldPrefix</code>,{" "}
          <code>TextFieldSuffix</code>, <code>TextFieldFooter</code> and the <code>textFieldControlVariants</code> /{" "}
          <code>textFieldLabelVariants</code> class helpers.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>The label is a real <code>&lt;label for&gt;</code>; clicking it focuses the input.</li>
          <li>
            Helper text, the error message and the counter are linked with <code>aria-describedby</code>; errors set{" "}
            <code>aria-invalid</code> and use <code>role=&quot;alert&quot;</code>.
          </li>
          <li>The counter is announced in a polite live region once typing pauses.</li>
          <li>Transitions are disabled when the user prefers reduced motion.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
