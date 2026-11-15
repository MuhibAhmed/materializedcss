import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { ButtonAsLink } from "~/registry/examples/button-as-link";
import { ButtonColors } from "~/registry/examples/button-colors";
import { ButtonDemo } from "~/registry/examples/button-demo";
import { ButtonPulse } from "~/registry/examples/button-pulse";
import { ButtonSizes } from "~/registry/examples/button-sizes";
import { ButtonVariants } from "~/registry/examples/button-variants";

export const metadata: Metadata = { title: "Button" };

export default function ButtonPage(): React.JSX.Element {
  return (
    <ComponentDoc name="button">
      <ComponentPreview name="button-demo">
        <ButtonDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="button" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Button } from "@/components/ui/button";`} />
        <CodeBlock className="mt-3" code={`<Button>Click me</Button>`} />
      </DocSection>

      <DocSection title="Variants">
        <p>
          <code>raised</code> is Materialize&apos;s default <code>.btn</code>. <code>flat</code> is for actions inside cards
          and dialogs. <code>outlined</code> is new, and <code>floating</code> is the circular action button.
        </p>
        <ComponentPreview name="button-variants">
          <ButtonVariants />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Colors">
        <p>
          Theme colors come from CSS variables, so they follow your theme and dark mode. Any palette utility such as{" "}
          <code>bg-md-indigo-500</code> also works.
        </p>
        <ComponentPreview name="button-colors">
          <ButtonColors />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Sizes">
        <ComponentPreview name="button-sizes">
          <ButtonSizes />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Pulse">
        <p>Draw attention to a primary action. The animation is turned off for users who prefer reduced motion.</p>
        <ComponentPreview name="button-pulse">
          <ButtonPulse />
        </ComponentPreview>
      </DocSection>

      <DocSection title="As a link">
        <p>
          Use <code>asChild</code> to give a link (or any element) button styling and the ripple, while keeping the right
          semantics.
        </p>
        <ComponentPreview name="button-as-link">
          <ButtonAsLink />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "variant", type: '"raised" | "flat" | "outlined" | "floating"', default: '"raised"', description: "Visual style." },
            {
              name: "color",
              type: '"default" | "primary" | "secondary" | "error" | "success"',
              default: '"default"',
              description: "Theme color. Default is teal for filled buttons and the text color for flat ones.",
            },
            { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "32px, 36px or 54px tall (floating: 32, 40 or 56px)." },
            { name: "ripple", type: "boolean", default: "true", description: "Show the ink ripple on press." },
            { name: "pulse", type: "boolean", default: "false", description: "Animated attention ring." },
            { name: "asChild", type: "boolean", default: "false", description: "Merge props onto the child element instead of rendering a <button>." },
          ]}
        />
        <p>
          All other <code>&lt;button&gt;</code> props are forwarded. <code>buttonVariants()</code> is exported for styling
          other elements.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>Renders a native <code>&lt;button type=&quot;button&quot;&gt;</code>, so Enter and Space work without extra code.</li>
          <li>Icon-only buttons need an <code>aria-label</code>.</li>
          <li>Keyboard focus shows a visible outline in the ring color.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
