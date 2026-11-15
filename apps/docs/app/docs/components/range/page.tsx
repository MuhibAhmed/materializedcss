import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { RangeControlled } from "~/registry/examples/range-controlled";
import { RangeDemo } from "~/registry/examples/range-demo";
import { RangeDisabled } from "~/registry/examples/range-disabled";
import { RangeForm } from "~/registry/examples/range-form";
import { RangeMultiple } from "~/registry/examples/range-multiple";
import { RangeStep } from "~/registry/examples/range-step";
import { RangeVertical } from "~/registry/examples/range-vertical";

export const metadata: Metadata = { title: "Range" };

export default function RangePage(): React.JSX.Element {
  return (
    <ComponentDoc name="range">
      <ComponentPreview name="range-demo">
        <RangeDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="range" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Range } from "@/components/ui/range";`} />
        <CodeBlock className="mt-3" code={`<Range aria-label="Volume" defaultValue={[40]} />`} />
        <p className="mt-3">
          Values are arrays with one number per thumb, so a single slider uses <code>[40]</code> and a range uses{" "}
          <code>[20, 80]</code>.
        </p>
      </DocSection>

      <DocSection title="Multiple thumbs">
        <p>
          Pass two (or more) values to select a range. <code>minStepsBetweenThumbs</code> keeps the thumbs apart, and{" "}
          <code>formatValue</code> / <code>getAriaValueText</code> format the bubble and what screen readers announce.
        </p>
        <ComponentPreview name="range-multiple">
          <RangeMultiple />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Steps and value label">
        <p>
          The bubble grows above the thumb while dragging and on keyboard focus (<code>valueLabel=&quot;auto&quot;</code>).
          Use <code>&quot;always&quot;</code> to keep it visible or <code>&quot;off&quot;</code> to hide it.
        </p>
        <ComponentPreview name="range-step">
          <RangeStep />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled">
        <ComponentPreview name="range-controlled">
          <RangeControlled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Vertical">
        <ComponentPreview name="range-vertical">
          <RangeVertical />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Disabled">
        <ComponentPreview name="range-disabled">
          <RangeDisabled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Forms">
        <p>
          With <code>name</code>, each thumb renders a hidden input. A multi-thumb range submits its values as{" "}
          <code>name[]</code>.
        </p>
        <ComponentPreview name="range-form">
          <RangeForm />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "value", type: "number[]", description: "Controlled values, one per thumb." },
            { name: "defaultValue", type: "number[]", default: "[min]", description: "Initial values (uncontrolled)." },
            { name: "onValueChange", type: "(value: number[]) => void", description: "Called while the value changes." },
            { name: "onValueCommit", type: "(value: number[]) => void", description: "Called when the user releases the thumb or presses a key." },
            { name: "min / max / step", type: "number", default: "0 / 100 / 1", description: "Bounds and step." },
            { name: "minStepsBetweenThumbs", type: "number", default: "0", description: "Minimum distance between thumbs, in steps." },
            { name: "formatValue", type: "(value, index) => ReactNode", description: "Content of the value bubble." },
            { name: "getAriaValueText", type: "(value, index) => string", description: "aria-valuetext for each thumb." },
            { name: "valueLabel", type: '"auto" | "always" | "off"', default: '"auto"', description: "When the value bubble is shown." },
            { name: "thumbLabels", type: "string[]", description: "Accessible names for the thumbs of a range (default Minimum / Maximum)." },
            { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Layout direction. Vertical sliders are 12rem tall by default." },
            { name: "disabled", type: "boolean", default: "false", description: "Disable all thumbs." },
            { name: "name", type: "string", description: "Submit the value with a form." },
            { name: "thumbClassName / trackClassName", type: "string", description: "Classes for the thumbs and the track." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <p>
          Give the slider a name with <code>aria-label</code> or <code>aria-labelledby</code>; it is passed to every thumb.
        </p>
        <PropsTable
          title="Keyboard"
          props={[
            { name: "Arrow keys", type: "", description: "Change the value by one step." },
            { name: "Shift + Arrow / Page Up / Page Down", type: "", description: "Change the value by ten steps." },
            { name: "Home / End", type: "", description: "Jump to the minimum / maximum." },
            { name: "Tab", type: "", description: "Move between thumbs." },
          ]}
        />
      </DocSection>
    </ComponentDoc>
  );
}
