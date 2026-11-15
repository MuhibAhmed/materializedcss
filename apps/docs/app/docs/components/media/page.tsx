import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { MediaCircle } from "~/registry/examples/media-circle";
import { MediaDemo } from "~/registry/examples/media-demo";
import { MediaVideo } from "~/registry/examples/media-video";

export const metadata: Metadata = { title: "Media" };

export default function MediaPage(): React.JSX.Element {
  return (
    <ComponentDoc name="media">
      <ComponentPreview name="media-demo">
        <MediaDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="media" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { CircleImage, ResponsiveImage, VideoContainer } from "@/components/ui/media";`} />
        <CodeBlock className="mt-3" code={`<ResponsiveImage src="/photo.jpg" alt="Sunrise" width={1200} height={800} />`} />
        <p>
          <code>ResponsiveImage</code> never grows wider than its container. Pass <code>width</code> and{" "}
          <code>height</code> to reserve space and avoid layout shift. For a zoomable image, see Materialbox.
        </p>
      </DocSection>

      <DocSection title="Circle images">
        <p>
          <code>CircleImage</code> crops any image to a circle with <code>object-fit: cover</code>, so non-square images are
          not squashed. <code>ResponsiveImage circle</code> does the same for fluid images.
        </p>
        <ComponentPreview name="media-circle">
          <MediaCircle />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Video embeds">
        <p>
          <code>VideoContainer</code> keeps an <code>&lt;iframe&gt;</code>, <code>&lt;video&gt;</code> or{" "}
          <code>&lt;object&gt;</code> at 16:9 (or any <code>ratio</code>) using CSS <code>aspect-ratio</code>.{" "}
          <code>ResponsiveVideo</code> is a <code>&lt;video&gt;</code> that scales down with its container.
        </p>
        <ComponentPreview name="media-video">
          <MediaVideo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="ResponsiveImage"
          props={[{ name: "circle", type: "boolean", default: "false", description: "Crop to a circle." }]}
        />
        <PropsTable
          title="CircleImage"
          props={[{ name: "size", type: "number | string", default: "80", description: "Diameter in px or any CSS length." }]}
        />
        <PropsTable
          title="VideoContainer"
          props={[{ name: "ratio", type: "number | string", default: "16 / 9", description: "Aspect ratio, e.g. 4 / 3 or \"1 / 1\"." }]}
        />
        <p>All components forward the props of the element they render.</p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            Give every image an <code>alt</code> text, or <code>alt=&quot;&quot;</code> when it is decorative.
          </li>
          <li>
            Give every <code>&lt;iframe&gt;</code> a <code>title</code> that describes the embedded content.
          </li>
          <li>Provide captions for videos with speech.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
