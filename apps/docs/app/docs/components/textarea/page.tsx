import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { TextareaControlled } from "~/registry/examples/textarea-controlled";
import { TextareaCounter } from "~/registry/examples/textarea-counter";
import { TextareaDemo } from "~/registry/examples/textarea-demo";
import { TextareaForm } from "~/registry/examples/textarea-form";
import { TextareaRows } from "~/registry/examples/textarea-rows";

export const metadata: Metadata = { title: "Textarea" };

export default function TextareaPage(): React.JSX.Element {
  return (
    <ComponentDoc name="textarea">
      <ComponentPreview name="textarea-demo">
        <TextareaDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="textarea" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Textarea } from "@/components/ui/textarea";`} />
        <CodeBlock className="mt-3" code={`<Textarea label="Message" name="message" />`} />
      </DocSection>

      <DocSection title="Character counter">
        <ComponentPreview name="textarea-counter">
          <TextareaCounter />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Rows">
        <p>
          <code>minRows</code> sets the starting height and <code>maxRows</code> caps the growth; after that the textarea
          scrolls. Set <code>autoResize=&#123;false&#125;</code> for a fixed height.
        </p>
        <ComponentPreview name="textarea-rows">
          <TextareaRows />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled">
        <p>Values set from state resize the textarea and float the label automatically.</p>
        <ComponentPreview name="textarea-controlled">
          <TextareaControlled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Forms">
        <ComponentPreview name="textarea-form">
          <TextareaForm />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Textarea"
          props={[
            { name: "label", type: "ReactNode", description: "Floating label." },
            { name: "helperText", type: "ReactNode", description: "Text under the field." },
            { name: "error", type: "ReactNode | boolean", description: "true or a message. Sets aria-invalid." },
            { name: "success", type: "boolean", default: "false", description: "Valid (green) state." },
            { name: "validate", type: "boolean", default: "false", description: "Color from native validation after interaction." },
            { name: "prefix", type: "ReactNode", description: "Leading icon." },
            { name: "variant", type: '"standard" | "outlined"', default: '"standard"', description: "Underline or outlined box." },
            { name: "autoResize", type: "boolean", default: "true", description: "Grow with the content." },
            { name: "minRows", type: "number", default: "1", description: "Minimum visible rows." },
            { name: "maxRows", type: "number", description: "Rows before the textarea scrolls." },
            { name: "showCount", type: "boolean", default: "false", description: "Show the n/maxLength counter." },
            { name: "enforceMaxLength", type: "boolean", default: "true", description: "Set native maxlength." },
            { name: "textareaClassName / labelClassName", type: "string", description: "Classes for the textarea and label." },
          ]}
        />
        <p>
          All other <code>&lt;textarea&gt;</code> props are forwarded.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            A native <code>&lt;textarea&gt;</code> with a real <code>&lt;label for&gt;</code>.
          </li>
          <li>
            Helper text, errors and the counter are linked with <code>aria-describedby</code>; errors use{" "}
            <code>role=&quot;alert&quot;</code>.
          </li>
          <li>Enter inserts a new line; Tab moves focus as usual.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
