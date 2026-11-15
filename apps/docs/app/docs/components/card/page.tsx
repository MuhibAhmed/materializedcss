import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { CardDemo } from "~/registry/examples/card-demo";
import { CardHorizontal } from "~/registry/examples/card-horizontal";
import { CardPanels } from "~/registry/examples/card-panels";
import { CardRevealDemo } from "~/registry/examples/card-reveal-demo";
import { CardSizes } from "~/registry/examples/card-sizes";
import { CardWithImage } from "~/registry/examples/card-with-image";

export const metadata: Metadata = { title: "Card" };

export default function CardPage(): React.JSX.Element {
  return (
    <ComponentDoc name="card">
      <ComponentPreview name="card-demo">
        <CardDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="card" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Card, CardAction, CardContent, CardTitle } from "@/components/ui/card";`} />
        <CodeBlock
          className="mt-3"
          code={`<Card>
  <CardContent>
    <CardTitle>Card Title</CardTitle>
    <p>Card content.</p>
  </CardContent>
  <CardAction>
    <a href="#">This is a link</a>
  </CardAction>
</Card>`}
        />
      </DocSection>

      <DocSection title="Image card">
        <p>
          Put an image in <code>CardImage</code>. A <code>CardTitle</code> inside it is overlaid in the bottom-left
          corner. Floating buttons can be positioned over the edge.
        </p>
      </DocSection>
      <ComponentPreview name="card-with-image">
        <CardWithImage />
      </ComponentPreview>

      <DocSection title="Card reveal">
        <p>
          <code>CardRevealRoot</code> is a card with a panel that slides up over it. <code>CardRevealTrigger</code> is a
          real button: it reports <code>aria-expanded</code>, focus moves to the panel&apos;s close button when it opens,
          and Escape closes it and returns focus. The reveal parts live in <code>card-reveal.tsx</code> so the rest of the
          card stays a server component.
        </p>
      </DocSection>
      <ComponentPreview name="card-reveal-demo">
        <CardRevealDemo />
      </ComponentPreview>

      <DocSection title="Horizontal">
        <p>
          Use <code>orientation=&quot;horizontal&quot;</code> and wrap the content and actions in{" "}
          <code>CardStacked</code>.
        </p>
      </DocSection>
      <ComponentPreview name="card-horizontal">
        <CardHorizontal />
      </ComponentPreview>

      <DocSection title="Sizes">
        <p>
          <code>sm</code>, <code>md</code> and <code>lg</code> fix the height to 300, 400 and 500px so cards in a grid line
          up. Overflowing content is clipped.
        </p>
      </DocSection>
      <ComponentPreview name="card-sizes">
        <CardSizes />
      </ComponentPreview>

      <DocSection title="Panels and hoverable">
        <p>
          <code>CardPanel</code> is a padded surface with card elevation. Add <code>hoverable</code> (a prop on{" "}
          <code>Card</code>, or the class on anything) to lift it on hover.
        </p>
      </DocSection>
      <ComponentPreview name="card-panels">
        <CardPanels />
      </ComponentPreview>

      <DocSection title="API Reference">
        <PropsTable
          title="Card"
          props={[
            { name: "size", type: '"auto" | "sm" | "md" | "lg"', default: '"auto"', description: "Fixed height of 300, 400 or 500px." },
            { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Image above or beside the content." },
            { name: "hoverable", type: "boolean", default: "false", description: "Raise the card on hover." },
          ]}
        />
        <PropsTable
          title="CardTitle"
          props={[{ name: "as", type: '"h2" | "h3" | "h4" | "h5" | "h6" | "span" | "div"', default: '"h3"', description: "Heading element." }]}
        />
        <PropsTable
          title="CardRevealRoot"
          props={[
            { name: "open", type: "boolean", description: "Controlled open state." },
            { name: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
            { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the panel opens or closes." },
          ]}
        />
        <PropsTable
          title="CardReveal"
          props={[
            { name: "title", type: "ReactNode", description: "Heading shown next to the close button." },
            { name: "closeLabel", type: "string", default: '"Close"', description: "Accessible label of the close button." },
          ]}
        />
        <p>
          <code>CardImage</code>, <code>CardContent</code>, <code>CardAction</code>, <code>CardStacked</code> and{" "}
          <code>CardPanel</code> render a <code>&lt;div&gt;</code> and forward all props.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            <kbd>Enter</kbd> / <kbd>Space</kbd> on the reveal trigger opens the panel and focuses its close button.
          </li>
          <li>
            <kbd>Escape</kbd> inside the panel, or the close button, closes it and returns focus to the trigger.
          </li>
          <li>The closed panel is <code>inert</code>, so it cannot be reached with Tab.</li>
          <li>
            Pick a <code>CardTitle</code> level (<code>as</code>) that fits your page outline, and give images a
            meaningful <code>alt</code>.
          </li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
