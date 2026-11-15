import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { TypographyBlockquote } from "~/registry/examples/typography-blockquote";
import { TypographyFlowText } from "~/registry/examples/typography-flow-text";
import { TypographyHeadings } from "~/registry/examples/typography-headings";
import { TypographyText } from "~/registry/examples/typography-text";

export const metadata: Metadata = { title: "Typography" };

export default function TypographyPage(): React.JSX.Element {
  return (
    <ComponentDoc name="typography">
      <ComponentPreview name="typography-headings" align="start">
        <TypographyHeadings />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="typography" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Blockquote, FlowText, Heading, Lead, Muted } from "@/components/ui/typography";`} />
        <CodeBlock className="mt-3" code={`<Heading level={2} size="h4">Section title</Heading>`} />
        <p>
          Materialize uses Roboto with light (300) and regular (400) weights. The heading sizes are theme tokens:{" "}
          <code>text-h1</code> (4.2rem) to <code>text-h6</code> (1.15rem), so you can also use them as utilities.
        </p>
      </DocSection>

      <DocSection title="Headings">
        <p>
          <code>level</code> picks the element; <code>size</code> changes only the look, so the document outline stays
          correct. <code>spacing=&quot;none&quot;</code> removes Materialize&apos;s heading margins.
        </p>
      </DocSection>

      <DocSection title="Text helpers">
        <p>
          <code>Lead</code> introduces a section; <code>Muted</code> is for captions and metadata.
        </p>
        <ComponentPreview name="typography-text" align="start">
          <TypographyText />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Blockquote">
        <p>A quotation with a 5px light-primary border on the left.</p>
        <ComponentPreview name="typography-blockquote">
          <TypographyBlockquote />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Flow text">
        <p>
          <code>FlowText</code> (or the <code>flow-text</code> utility) scales its size with the viewport using CSS{" "}
          <code>clamp()</code>, instead of Materialize&apos;s resize listener.
        </p>
        <ComponentPreview name="typography-flow-text">
          <TypographyFlowText />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Heading"
          props={[
            { name: "level", type: "1 | 2 | 3 | 4 | 5 | 6", default: "1", description: "Heading element <h1>–<h6>." },
            { name: "size", type: '"h1" | "h2" | "h3" | "h4" | "h5" | "h6"', default: "from level", description: "Visual size." },
            { name: "spacing", type: '"default" | "none"', default: '"default"', description: "Materialize margins, or none." },
          ]}
        />
        <PropsTable
          title="FlowText"
          props={[{ name: "as", type: '"p" | "div"', default: '"p"', description: "Element to render." }]}
        />
        <p>
          <code>Blockquote</code>, <code>Lead</code> and <code>Muted</code> render <code>&lt;blockquote&gt;</code> and{" "}
          <code>&lt;p&gt;</code> and forward their props. <code>headingVariants()</code> is exported. For the line
          separator, see <a href="/docs/components/divider" className="underline">Divider</a>.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>Keep heading levels in order; use <code>size</code> to change how a heading looks.</li>
          <li>Text colors come from tokens that meet WCAG AA contrast in light and dark mode.</li>
          <li>Sizes use rem, so text scales with the user&apos;s font-size setting.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
