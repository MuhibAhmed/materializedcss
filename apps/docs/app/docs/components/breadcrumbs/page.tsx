import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { BreadcrumbsDemo } from "~/registry/examples/breadcrumbs-demo";
import { BreadcrumbsStandalone } from "~/registry/examples/breadcrumbs-standalone";

export const metadata: Metadata = { title: "Breadcrumbs" };

export default function BreadcrumbsPage(): React.JSX.Element {
  return (
    <ComponentDoc name="breadcrumbs">
      <ComponentPreview name="breadcrumbs-demo" bleed align="start" className="min-h-0">
        <BreadcrumbsDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="breadcrumbs" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumbs,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumbs";`}
        />
        <CodeBlock
          className="mt-3"
          code={`<Breadcrumbs>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Settings</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumbs>`}
        />
      </DocSection>

      <DocSection title="Standalone">
        <p>
          Breadcrumbs inherit the text color, so they also work on the page background. Links accept icons, and{" "}
          <code>asChild</code> renders a router link.
        </p>
        <ComponentPreview name="breadcrumbs-standalone">
          <BreadcrumbsStandalone />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Breadcrumbs"
          props={[{ name: "aria-label", type: "string", default: '"Breadcrumb"', description: "Name of the navigation landmark." }]}
        />
        <PropsTable
          title="BreadcrumbLink"
          props={[{ name: "asChild", type: "boolean", default: "false", description: "Render the child element instead of <a>." }]}
        />
        <PropsTable
          title="BreadcrumbSeparator"
          props={[{ name: "children", type: "ReactNode", default: "chevron icon", description: "Custom separator." }]}
        />
        <p>
          <code>BreadcrumbList</code> renders <code>&lt;ol&gt;</code>, <code>BreadcrumbItem</code> a <code>&lt;li&gt;</code>{" "}
          and <code>BreadcrumbPage</code> a <code>&lt;span aria-current=&quot;page&quot;&gt;</code>.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            Follows the WAI-ARIA breadcrumb pattern: a <code>&lt;nav aria-label=&quot;Breadcrumb&quot;&gt;</code> with an
            ordered list.
          </li>
          <li>The current page is marked with <code>aria-current=&quot;page&quot;</code>.</li>
          <li>Separators are hidden from assistive technology.</li>
          <li>If a page has more than one breadcrumb trail, give each a distinct <code>aria-label</code>.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
