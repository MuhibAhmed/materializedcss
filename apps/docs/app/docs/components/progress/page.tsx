import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { ProgressDemo } from "~/registry/examples/progress-demo";
import { ProgressIndeterminate } from "~/registry/examples/progress-indeterminate";

export const metadata: Metadata = { title: "Progress" };

export default function ProgressPage(): React.JSX.Element {
  return (
    <ComponentDoc name="progress">
      <ComponentPreview name="progress-demo">
        <ProgressDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="progress" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Progress } from "@/components/ui/progress";`} />
        <CodeBlock className="mt-3" code={`<Progress value={70} label="Upload progress" />`} />
      </DocSection>

      <DocSection title="Indeterminate">
        <p>
          Leave out <code>value</code> when the duration is unknown. The two bars loop exactly like Materialize&apos;s{" "}
          <code>.indeterminate</code>; with reduced motion a single bar sweeps slowly instead.
        </p>
      </DocSection>
      <ComponentPreview name="progress-indeterminate">
        <ProgressIndeterminate />
      </ComponentPreview>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "value", type: "number | null", description: "Progress between min and max. Omit for indeterminate." },
            { name: "min", type: "number", default: "0", description: "Lower bound." },
            { name: "max", type: "number", default: "100", description: "Upper bound." },
            { name: "label", type: "string", description: "Accessible name (or pass aria-labelledby)." },
            { name: "valueText", type: "string", description: "Human readable value, e.g. \"3 of 10 files\"." },
            { name: "color", type: '"secondary" | "primary"', default: '"secondary"', description: "Bar and track color." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            Renders <code>role=&quot;progressbar&quot;</code> with <code>aria-valuemin</code>, <code>aria-valuemax</code>{" "}
            and <code>aria-valuenow</code>. <code>aria-valuenow</code> is omitted while indeterminate, as ARIA requires.
          </li>
          <li>Always give the bar a name with <code>label</code>, <code>aria-label</code> or <code>aria-labelledby</code>.</li>
          <li>The fill animation and the indeterminate loop respect reduced motion.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
