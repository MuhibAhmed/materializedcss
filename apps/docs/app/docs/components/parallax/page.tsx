import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { ParallaxContent } from "~/registry/examples/parallax-content";
import { ParallaxDemo } from "~/registry/examples/parallax-demo";

export const metadata: Metadata = { title: "Parallax" };

export default function ParallaxPage(): React.JSX.Element {
  return (
    <ComponentDoc name="parallax">
      <ComponentPreview name="parallax-demo" bleed>
        <ParallaxDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="parallax" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Parallax } from "@/components/ui/parallax";`} />
        <CodeBlock className="mt-3" code={`<Parallax src="/images/mountains.jpg" height={500} />`} />
        <p>
          The image is rendered <code>1 + speed</code> times taller than the container and travels from bottom-aligned to
          top-aligned while the container crosses the viewport.
        </p>
      </DocSection>

      <DocSection title="With content">
        <p>Children are rendered over the image, so the container works as a hero section.</p>
        <ComponentPreview name="parallax-content" className="p-0 sm:p-0">
          <ParallaxContent />
        </ComponentPreview>
      </DocSection>

      <DocSection title="How it works">
        <ul>
          <li>
            Where CSS scroll-driven animations are supported, the image is animated on a <code>ViewTimeline</code>{" "}
            (<code>animation-timeline: view()</code>) and runs off the main thread.
          </li>
          <li>
            Elsewhere a passive, <code>requestAnimationFrame</code>-throttled scroll handler moves the image, attached only
            while the container intersects the viewport.
          </li>
          <li>
            Inside an <code>overflow: hidden</code> ancestor (which would freeze a view timeline) the scroll handler is
            used automatically.
          </li>
          <li>When the user prefers reduced motion the image stays still and centered.</li>
        </ul>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "src", type: "string", description: "Background image URL." },
            { name: "alt", type: "string", default: '""', description: "Alternative text; empty for decorative images." },
            { name: "height", type: "number | string", default: "500", description: "Height of the container." },
            { name: "speed", type: "number", default: "0.5", description: "Strength of the effect, 0 to 1." },
            { name: "imageClassName", type: "string", description: "Classes for the image (e.g. object-position)." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>The image is decorative by default (<code>alt=&quot;&quot;</code>); pass <code>alt</code> if it carries meaning.</li>
          <li>Motion is removed for users who prefer reduced motion.</li>
          <li>Keep text on top of images legible with a scrim, as in the example above.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
