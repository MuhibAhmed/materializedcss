import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { CarouselAutoplay } from "~/registry/examples/carousel-autoplay";
import { CarouselControlled } from "~/registry/examples/carousel-controlled";
import { CarouselDemo } from "~/registry/examples/carousel-demo";
import { CarouselFullWidth } from "~/registry/examples/carousel-full-width";

export const metadata: Metadata = { title: "Carousel" };

export default function CarouselPage(): React.JSX.Element {
  return (
    <ComponentDoc name="carousel">
      <ComponentPreview name="carousel-demo" className="p-0 sm:p-4">
        <CarouselDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="carousel" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Carousel, CarouselItem } from "@/components/ui/carousel";`} />
        <CodeBlock
          className="mt-3"
          code={`<Carousel aria-label="Landscapes">
  <CarouselItem>
    <img src="/one.jpg" alt="Mountains at dawn" />
  </CarouselItem>
  <CarouselItem>
    <img src="/two.jpg" alt="Forest lake" />
  </CarouselItem>
</Carousel>`}
        />
        <p>
          Drag or swipe horizontally, click a side item to bring it to the center, focus the carousel and use the arrow
          keys, or use the previous/next buttons. Tune the 3D effect with <code>dist</code>, <code>shift</code>,{" "}
          <code>padding</code> and <code>numVisible</code>.
        </p>
      </DocSection>

      <DocSection title="Full width">
        <p>
          <code>fullWidth</code> turns the carousel into a slider where each item fills the width. Add{" "}
          <code>indicators</code> for dot navigation and <code>fixedContent</code> for content that stays put. Links
          and buttons inside slides work with mouse and touch; a drag never triggers them.
        </p>
        <ComponentPreview name="carousel-full-width" className="p-0 sm:p-4">
          <CarouselFullWidth />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Autoplay">
        <p>
          <code>autoplay</code> advances every 5 seconds (or pass milliseconds). Rotation pauses while the pointer is over
          the carousel or keyboard focus is inside it, starts paused when the user prefers reduced motion, and the
          pause button stops it entirely.
        </p>
        <ComponentPreview name="carousel-autoplay" className="p-0 sm:p-4">
          <CarouselAutoplay />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled">
        <p>
          Control the slide with <code>activeIndex</code> and <code>onIndexChange</code>, or drive it through the{" "}
          <code>ref</code> handle (<code>next()</code>, <code>prev()</code>, <code>set(index)</code>). <code>noWrap</code>{" "}
          stops at both ends.
        </p>
        <ComponentPreview name="carousel-controlled" className="p-0 sm:p-4">
          <CarouselControlled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Carousel"
          props={[
            { name: "aria-label", type: "string", description: "Accessible name of the carousel region." },
            { name: "fullWidth", type: "boolean", default: "false", description: "One full-width slide at a time." },
            { name: "indicators", type: "boolean", default: "false", description: "Dot buttons for each slide." },
            { name: "controls", type: "boolean", default: "true", description: "Previous/next buttons." },
            { name: "noWrap", type: "boolean", default: "false", description: "Stop at the first and last slide." },
            { name: "dist", type: "number", default: "-100", description: "3D depth of side items (translateZ)." },
            { name: "shift", type: "number", default: "0", description: "Extra space around the center item (px)." },
            { name: "padding", type: "number", default: "0", description: "Space between side items (px)." },
            { name: "numVisible", type: "number", default: "5", description: "Items visible in the 3D mode." },
            { name: "duration", type: "number", default: "200", description: "Snap animation time constant (ms)." },
            { name: "height", type: "number | string", default: "400", description: "Height of the carousel." },
            { name: "activeIndex", type: "number", description: "Controlled centered slide." },
            { name: "defaultIndex", type: "number", default: "0", description: "Initial slide when uncontrolled." },
            { name: "onIndexChange", type: "(index: number) => void", description: "Called when the centered slide changes." },
            { name: "autoplay", type: "boolean | number", default: "false", description: "Rotate every 5000ms or the given ms." },
            { name: "fixedContent", type: "ReactNode", description: "Content pinned over the slides." },
            { name: "labels", type: "Partial<CarouselLabels>", description: "Localized labels for buttons and slides." },
            { name: "ref", type: "Ref<CarouselHandle>", description: "{ next(n?), prev(n?), set(index) }." },
          ]}
        />
        <PropsTable
          title="CarouselItem"
          props={[
            { name: "className", type: "string", description: "Items are 200×200px in 3D mode; override the size here." },
          ]}
        />
        <p>
          <code>useCarouselAutoplay</code> is exported too; the Slider uses it for the same pause behavior.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <p>
          The carousel is a <code>region</code> with <code>aria-roledescription=&quot;carousel&quot;</code>; each slide is
          a <code>group</code> with <code>aria-roledescription=&quot;slide&quot;</code> and an &quot;n of N&quot; label.
          Slide changes are announced politely, except while autoplay is rotating. In full-width mode, off-screen slides
          are inert so keyboard focus never lands on hidden content.
        </p>
        <ul>
          <li>
            <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> on the focused carousel show the previous or next slide.
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> go to the first or last slide.
          </li>
          <li>
            <kbd>Tab</kbd> reaches the previous/next, pause and indicator buttons.
          </li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
