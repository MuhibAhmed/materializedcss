import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { DividerDemo } from "~/registry/examples/divider-demo";
import { DividerVertical } from "~/registry/examples/divider-vertical";

export const metadata: Metadata = { title: "Divider" };

export default function DividerPage(): React.JSX.Element {
  return (
    <ComponentDoc name="divider">
      <ComponentPreview name="divider-demo">
        <DividerDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="divider" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Divider } from "@/components/ui/divider";`} />
        <CodeBlock className="mt-3" code={`<Divider />`} />
      </DocSection>

      <DocSection title="Vertical">
        <p>
          In a flex row, a vertical divider stretches to the row height. Mark purely visual lines as{" "}
          <code>decorative</code>.
        </p>
        <ComponentPreview name="divider-vertical">
          <DividerVertical />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Direction of the line." },
            { name: "decorative", type: "boolean", default: "false", description: "Hide from assistive technology (role=\"none\")." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            By default the divider has <code>role=&quot;separator&quot;</code> (vertical ones also{" "}
            <code>aria-orientation=&quot;vertical&quot;</code>), so screen readers announce the break between sections.
          </li>
          <li>
            Use <code>decorative</code> when the line is only visual, like between links in a toolbar.
          </li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
