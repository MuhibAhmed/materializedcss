import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { ChipDeletable } from "~/registry/examples/chip-deletable";
import { ChipDemo } from "~/registry/examples/chip-demo";
import { ChipFilter } from "~/registry/examples/chip-filter";

export const metadata: Metadata = { title: "Chip" };

export default function ChipPage(): React.JSX.Element {
  return (
    <ComponentDoc name="chip">
      <ComponentPreview name="chip-demo">
        <ChipDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="chip" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Chip } from "@/components/ui/chip";`} />
        <CodeBlock className="mt-3" code={`<Chip image="/avatars/jane.jpg">Jane Doe</Chip>`} />
      </DocSection>

      <DocSection title="Deletable">
        <p>
          Pass <code>onDelete</code> to show a close button. It is labelled &quot;Remove &lt;text&gt;&quot; by default;
          override it with <code>deleteLabel</code>.
        </p>
        <ComponentPreview name="chip-deletable">
          <ChipDeletable />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Filter chips">
        <p>
          With <code>asChild</code>, a <code>&lt;button aria-pressed&gt;</code> gets chip styling, giving you toggleable
          filter chips with the right semantics.
        </p>
        <ComponentPreview name="chip-filter">
          <ChipFilter />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Tag input">
        <p>
          To let users type chips, use the <code>ChipsInput</code> component (Chips Input page).
        </p>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Chip"
          props={[
            { name: "image", type: "string", description: "Avatar URL (32px circle). Unsafe schemes are dropped." },
            { name: "imageAlt", type: "string", default: '""', description: "Alt text for the image." },
            { name: "selected", type: "boolean", default: "false", description: "Secondary background." },
            { name: "onDelete", type: "function", description: "Shows a close button that calls it." },
            { name: "deleteLabel", type: "string", default: '"Remove <text>"', description: "Name of the close button." },
            { name: "deleteButtonProps", type: "ComponentProps<\"button\">", description: "Extra close button props." },
            { name: "asChild", type: "boolean", default: "false", description: "Style the child element as a chip." },
            { name: "disabled", type: "boolean", default: "false", description: "Dimmed; disables the close button." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>The close button is a native button with an accessible name and a visible focus ring.</li>
          <li>Plain chips are static text. For interactive chips use <code>asChild</code> with a button or link.</li>
          <li>Images are decorative by default; set <code>imageAlt</code> when the image adds information.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
