import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { MaterialboxCaption } from "~/registry/examples/materialbox-caption";
import { MaterialboxDemo } from "~/registry/examples/materialbox-demo";

export const metadata: Metadata = { title: "Materialbox" };

export default function MaterialboxPage(): React.JSX.Element {
  return (
    <ComponentDoc name="materialbox">
      <ComponentPreview name="materialbox-demo">
        <MaterialboxDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="materialbox" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Materialbox } from "@/components/ui/materialbox";`} />
        <CodeBlock
          className="mt-3"
          code={`<Materialbox src="/photo.jpg" alt="Harbor at dusk" width={1200} height={800} className="w-[350px]" />`}
        />
        <p>
          Click the image to zoom it to fit the screen. Click anywhere, press <kbd>Escape</kbd> or scroll to zoom back
          out. <code>alt</code> is required because it also names the zoom button and the dialog. Pass{" "}
          <code>zoomSrc</code> to load a larger file only when the image is zoomed.
        </p>
      </DocSection>

      <DocSection title="Captions">
        <p>
          A <code>caption</code> is shown under the zoomed image, like Materialize&apos;s <code>data-caption</code>.
          Screen readers read it as the dialog&apos;s description.
        </p>
        <ComponentPreview name="materialbox-caption">
          <MaterialboxCaption />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Materialbox"
          props={[
            { name: "src", type: "string", description: "Thumbnail URL." },
            { name: "alt", type: "string", description: "Required alternative text." },
            { name: "zoomSrc", type: "string", description: "Larger image to show when zoomed. Defaults to src." },
            { name: "caption", type: "ReactNode", description: "Caption under the zoomed image." },
            { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Controlled or uncontrolled zoom state." },
            { name: "inDuration", type: "number", default: "275", description: "Zoom-in duration in ms." },
            { name: "outDuration", type: "number", default: "200", description: "Zoom-out duration in ms." },
            { name: "triggerClassName", type: "string", description: "Classes for the button around the thumbnail." },
            { name: "...img props", type: "ComponentProps<'img'>", description: "width, height, className, loading and so on go to the thumbnail." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            The thumbnail is wrapped in a button named &quot;Enlarge image: &lt;alt&gt;&quot;, so keyboard users can open
            it with <kbd>Enter</kbd> or <kbd>Space</kbd>.
          </li>
          <li>
            The zoomed view is a modal dialog titled with the alt text. Focus moves into it, stays inside it, and returns
            to the thumbnail when it closes.
          </li>
          <li>It uses a portal, so parents with <code>overflow: hidden</code> or a transform cannot clip the zoomed image.</li>
          <li>The zoom animation is skipped when the user prefers reduced motion.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
