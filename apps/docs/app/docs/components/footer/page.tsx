import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { FooterDemo } from "~/registry/examples/footer-demo";

export const metadata: Metadata = { title: "Footer" };

export default function FooterPage(): React.JSX.Element {
  return (
    <ComponentDoc name="footer">
      <ComponentPreview name="footer-demo" bleed align="start" className="items-end">
        <FooterDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="footer" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { Footer, FooterContent, FooterCopyright, FooterSection, FooterTitle } from "@/components/ui/footer";`}
        />
        <CodeBlock
          className="mt-3"
          code={`<Footer>
  <FooterContent>
    <FooterSection>
      <FooterTitle>Footer Content</FooterTitle>
    </FooterSection>
  </FooterContent>
  <FooterCopyright>© 2026 Copyright Text</FooterCopyright>
</Footer>`}
        />
      </DocSection>

      <DocSection title="Layout">
        <p>
          <code>FooterContent</code> is a centered container (90% wide, up to 1280px) with a two-column grid from the{" "}
          <code>md</code> breakpoint (2:1, like Materialize&apos;s <code>l6</code> + <code>l4 offset-l2</code> columns).
          Override the columns with <code>className</code>, for example{" "}
          <code>md:grid-cols-3</code>. <code>FooterCopyright</code> spreads its children to both ends.
        </p>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="FooterTitle"
          props={[{ name: "as", type: '"h2" | "h3" | "h4" | "h5" | "h6" | "p"', default: '"h2"', description: "Heading element (styled like h5)." }]}
        />
        <PropsTable
          title="FooterLink"
          props={[{ name: "asChild", type: "boolean", default: "false", description: "Render the child element (e.g. a router link)." }]}
        />
        <p>
          <code>Footer</code> renders <code>&lt;footer&gt;</code>, <code>FooterSection</code> a{" "}
          <code>&lt;section&gt;</code>, <code>FooterLinks</code> a <code>&lt;ul&gt;</code> and{" "}
          <code>FooterText</code> a <code>&lt;p&gt;</code>. All parts forward their props.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            A page-level <code>&lt;footer&gt;</code> is exposed as the <code>contentinfo</code> landmark.
          </li>
          <li>
            Wrap link lists in <code>&lt;nav aria-label&gt;</code> when they are navigation.
          </li>
          <li>
            Text uses the primary foreground color for AA contrast; the copyright strip is darkened in light mode and
            lightened in dark mode to keep its 90% text readable.
          </li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
