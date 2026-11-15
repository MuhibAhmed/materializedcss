import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { PreloaderColors } from "~/registry/examples/preloader-colors";
import { PreloaderDemo } from "~/registry/examples/preloader-demo";
import { PreloaderSizes } from "~/registry/examples/preloader-sizes";

export const metadata: Metadata = { title: "Preloader" };

export default function PreloaderPage(): React.JSX.Element {
  return (
    <ComponentDoc name="preloader">
      <ComponentPreview name="preloader-demo">
        <PreloaderDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="preloader" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Preloader } from "@/components/ui/preloader";`} />
        <CodeBlock className="mt-3" code={`<Preloader />`} />
        <p>
          For a linear bar, see <a href="/docs/components/progress" className="underline">Progress</a>.
        </p>
      </DocSection>

      <DocSection title="Sizes">
        <p>
          <code>sm</code> (36px), <code>md</code> (50px) and <code>lg</code> (64px), all with a 3px stroke.
        </p>
        <ComponentPreview name="preloader-sizes">
          <PreloaderSizes />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Colors">
        <p>
          Use a theme color, any CSS color, or <code>multicolor</code> to cycle through blue, red, yellow and green like
          Materialize&apos;s Google-colored spinner.
        </p>
        <ComponentPreview name="preloader-colors">
          <PreloaderColors />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "36, 50 or 64px." },
            {
              name: "color",
              type: '"secondary" | "primary" | "error" | "success" | "current" | string',
              default: '"secondary"',
              description: "Theme color name or any CSS color.",
            },
            { name: "multicolor", type: "boolean", default: "false", description: "Cycle blue, red, yellow and green." },
            { name: "label", type: "string", default: '"Loading"', description: "Accessible name." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            Renders <code>role=&quot;status&quot;</code> with an accessible name (&quot;Loading&quot;). Describe what is
            loading when there are several on a page.
          </li>
          <li>
            Mark the region being loaded with <code>aria-busy=&quot;true&quot;</code> while the spinner shows.
          </li>
          <li>
            With <code>prefers-reduced-motion</code> the arc stops filling and unfilling and only turns slowly, so
            activity is still visible.
          </li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
