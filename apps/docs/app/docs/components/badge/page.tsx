import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { BadgeColors } from "~/registry/examples/badge-colors";
import { BadgeDemo } from "~/registry/examples/badge-demo";
import { BadgeNavbar } from "~/registry/examples/badge-navbar";

export const metadata: Metadata = { title: "Badge" };

export default function BadgePage(): React.JSX.Element {
  return (
    <ComponentDoc name="badge">
      <ComponentPreview name="badge-demo">
        <BadgeDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="badge" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Badge } from "@/components/ui/badge";`} />
        <CodeBlock className="mt-3" code={`<Badge variant="new">4</Badge>`} />
      </DocSection>

      <DocSection title="Colors and captions">
        <p>
          The <code>new</code> variant appends the caption &quot;new&quot;. Pass <code>caption</code> to change it, or{" "}
          <code>caption={"{null}"}</code> to hide it. The caption is real text, so it is read aloud.
        </p>
      </DocSection>
      <ComponentPreview name="badge-colors">
        <BadgeColors />
      </ComponentPreview>

      <DocSection title="In a navbar">
        <p>Badges sit inline after the link text.</p>
      </DocSection>
      <ComponentPreview name="badge-navbar" bleed align="start" className="min-h-0">
        <BadgeNavbar />
      </ComponentPreview>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "variant", type: '"default" | "new"', default: '"default"', description: "Plain count, or the filled notification badge." },
            {
              name: "color",
              type: '"default" | "primary" | "secondary" | "error" | "success"',
              default: '"default"',
              description: "Fill of a new badge. Default is the secondary color.",
            },
            { name: "caption", type: "ReactNode", default: '"new" for variant="new"', description: "Text after the content. null hides it." },
          ]}
        />
        <p>
          All other <code>&lt;span&gt;</code> props are forwarded. <code>badgeVariants()</code> is exported.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>The badge is plain text inside its parent, so &quot;Inbox 4 new&quot; is read as one phrase.</li>
          <li>
            If a number alone is unclear, give it context with a caption (<code>caption=&quot;unread&quot;</code>) or a
            visually hidden label.
          </li>
          <li>For counts that change live, wrap them in a region with <code>aria-live=&quot;polite&quot;</code>.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
