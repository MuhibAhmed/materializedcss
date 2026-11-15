import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { Callout, DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { TabsDemo } from "~/registry/examples/tabs-demo";
import { TabsFixedWidth } from "~/registry/examples/tabs-fixed-width";
import { TabsHidden } from "~/registry/examples/tabs-hidden";
import { TabsManual } from "~/registry/examples/tabs-manual";
import { TabsRtl } from "~/registry/examples/tabs-rtl";
import { TabsScrollable } from "~/registry/examples/tabs-scrollable";
import { TabsTransparent } from "~/registry/examples/tabs-transparent";

export const metadata: Metadata = { title: "Tabs" };

export default function TabsPage(): React.JSX.Element {
  return (
    <ComponentDoc name="tabs">
      <ComponentPreview name="tabs-demo">
        <TabsDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="tabs" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";`} />
        <CodeBlock
          className="mt-3"
          code={`<Tabs defaultValue="account">
  <TabsList aria-label="Settings">
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings</TabsContent>
  <TabsContent value="password">Change your password</TabsContent>
</Tabs>`}
        />
      </DocSection>

      <DocSection title="Fixed width">
        <p>
          <code>fixedWidth</code> gives every tab an equal share of the width (Materialize <code>.tabs-fixed-width</code>).
          On small screens tabs always grow to fill the strip.
        </p>
        <ComponentPreview name="tabs-fixed-width">
          <TabsFixedWidth />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Transparent">
        <p>
          Use <code>transparent</code> for tabs on a colored toolbar or extended navbar. Labels and the indicator turn
          white. Pick a background dark enough for the 70% white inactive labels to stay readable.
        </p>
        <ComponentPreview name="tabs-transparent">
          <TabsTransparent />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Scrollable">
        <p>
          When tabs don&apos;t fit, the strip scrolls horizontally. The active tab is scrolled into view when it changes,
          and the indicator stays aligned while scrolling.
        </p>
        <ComponentPreview name="tabs-scrollable">
          <TabsScrollable />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled, manual activation">
        <p>
          Pass <code>value</code> and <code>onValueChange</code> to control the selected tab. With{" "}
          <code>activationMode=&quot;manual&quot;</code>, arrow keys only move focus and Enter or Space selects.
        </p>
        <ComponentPreview name="tabs-manual">
          <TabsManual />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Right to left">
        <p>
          Set <code>dir=&quot;rtl&quot;</code> on <code>Tabs</code>. Arrow keys are mirrored and the indicator is
          positioned correctly.
        </p>
        <ComponentPreview name="tabs-rtl">
          <TabsRtl />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Initially hidden">
        <p>
          Tabs rendered inside a hidden parent (a closed collapsible, an inactive panel or a modal) measure their indicator
          as soon as they become visible.
        </p>
        <ComponentPreview name="tabs-hidden">
          <TabsHidden />
        </ComponentPreview>
        <Callout title="Not included">
          Materialize&apos;s optional <code>swipeable</code> tab content (a carousel behind the panels) is not part of
          this component. Combine <code>Tabs</code> with the <code>Carousel</code> in full-width mode if you need it.
        </Callout>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Tabs"
          props={[
            { name: "value", type: "string", description: "Controlled selected tab." },
            { name: "defaultValue", type: "string", description: "Initially selected tab when uncontrolled." },
            { name: "onValueChange", type: "(value: string) => void", description: "Called when the selected tab changes." },
            {
              name: "activationMode",
              type: '"automatic" | "manual"',
              default: '"automatic"',
              description: "Select on focus, or only on Enter/Space/click.",
            },
            { name: "dir", type: '"ltr" | "rtl"', description: "Reading direction for keyboard navigation and layout." },
          ]}
        />
        <PropsTable
          title="TabsList"
          props={[
            { name: "fixedWidth", type: "boolean", default: "false", description: "Equal-width tabs that fill the strip." },
            { name: "transparent", type: "boolean", default: "false", description: "White labels and indicator for colored backgrounds." },
            { name: "indicatorClassName", type: "string", description: "Classes for the indicator, e.g. bg-secondary." },
            { name: "loop", type: "boolean", default: "true", description: "Arrow keys wrap from the last tab to the first." },
          ]}
        />
        <PropsTable
          title="TabsTrigger"
          props={[
            { name: "value", type: "string", description: "Identifies the tab and its panel." },
            { name: "disabled", type: "boolean", default: "false", description: "Skip the tab in keyboard navigation and ignore clicks." },
            { name: "ripple", type: "boolean", default: "true", description: "Ink ripple on press." },
          ]}
        />
        <PropsTable
          title="TabsContent"
          props={[
            { name: "value", type: "string", description: "The tab this panel belongs to." },
            { name: "forceMount", type: "true", description: "Keep the panel mounted while inactive (hidden)." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <p>
          Implements the WAI-ARIA tabs pattern: <code>tablist</code>, <code>tab</code> and <code>tabpanel</code> roles with{" "}
          <code>aria-selected</code> and <code>aria-controls</code>. Give each <code>TabsList</code> an{" "}
          <code>aria-label</code>.
        </p>
        <ul>
          <li>
            <kbd>Tab</kbd> moves focus to the selected tab, then into the panel.
          </li>
          <li>
            <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> move to the previous or next tab (mirrored in RTL) and select it in
            automatic mode.
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> move to the first or last tab.
          </li>
          <li>
            <kbd>Enter</kbd> / <kbd>Space</kbd> select the focused tab in manual mode.
          </li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
