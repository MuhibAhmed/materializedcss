import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { SliderDemo } from "~/registry/examples/slider-demo";
import { SliderManual } from "~/registry/examples/slider-manual";

export const metadata: Metadata = { title: "Slider" };

export default function SliderPage(): React.JSX.Element {
  return (
    <ComponentDoc name="slider">
      <ComponentPreview name="slider-demo" className="p-0 sm:p-4">
        <SliderDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="slider" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Slider, SliderCaption, SliderItem } from "@/components/ui/slider";`} />
        <CodeBlock
          className="mt-3"
          code={`<Slider aria-label="Featured">
  <SliderItem>
    <img src="/one.jpg" alt="" />
    <SliderCaption align="center">
      <h3>This is our big Tagline!</h3>
    </SliderCaption>
  </SliderItem>
</Slider>`}
        />
        <p>
          Slides crossfade over <code>duration</code> (500ms) and each one stays for <code>interval</code> (6000ms).
          Captions slide in from the left, top or right depending on <code>align</code>, after the slide has appeared.
          The slider reuses the carousel&apos;s <code>useCarouselAutoplay</code> hook, so it installs the carousel too.
        </p>
      </DocSection>

      <DocSection title="Without autoplay">
        <p>
          Set <code>autoplay=&#123;false&#125;</code> and control the slide with <code>activeIndex</code> and{" "}
          <code>onIndexChange</code>. For a fullscreen hero, pass <code>height=&quot;100dvh&quot;</code>.
        </p>
        <ComponentPreview name="slider-manual" className="p-0 sm:p-4">
          <SliderManual />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Slider"
          props={[
            { name: "aria-label", type: "string", description: "Accessible name of the slide show." },
            { name: "height", type: "number | string", default: "400", description: "Height of the slides." },
            { name: "indicators", type: "boolean", default: "true", description: "Dot buttons below the slides." },
            { name: "autoplay", type: "boolean", default: "true", description: "Rotate automatically (pausable)." },
            { name: "interval", type: "number", default: "6000", description: "Time each slide is shown (ms)." },
            { name: "duration", type: "number", default: "500", description: "Transition duration (ms)." },
            { name: "activeIndex", type: "number", description: "Controlled active slide." },
            { name: "defaultIndex", type: "number", default: "0", description: "Initial slide when uncontrolled." },
            { name: "onIndexChange", type: "(index: number) => void", description: "Called when the slide changes." },
            { name: "labels", type: "Partial<SliderLabels>", description: "Localized labels." },
          ]}
        />
        <PropsTable
          title="SliderCaption"
          props={[
            {
              name: "align",
              type: '"left" | "center" | "right"',
              default: '"center"',
              description: "Text alignment and the side the caption slides in from.",
            },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            The slider is a <code>region</code> with <code>aria-roledescription=&quot;carousel&quot;</code>; slides are
            labelled &quot;n of N&quot; groups and inactive slides are inert.
          </li>
          <li>
            Rotation pauses while the pointer is over the slider or keyboard focus is inside it; the pause button stops it
            (WCAG 2.2.2). It starts paused when the user prefers reduced motion.
          </li>
          <li>
            <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd>, <kbd>Home</kbd> and <kbd>End</kbd> change slides when the
            slides are focused.
          </li>
          <li>Give decorative images an empty <code>alt</code> and put the message in the caption.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
