import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { Callout, DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { SidenavDemo } from "~/registry/examples/sidenav-demo";
import { SidenavFixed } from "~/registry/examples/sidenav-fixed";
import { SidenavRight } from "~/registry/examples/sidenav-right";

export const metadata: Metadata = { title: "Sidenav" };

export default function SidenavPage(): React.JSX.Element {
  return (
    <ComponentDoc name="sidenav">
      <ComponentPreview name="sidenav-demo">
        <SidenavDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="sidenav" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import {
  Sidenav, SidenavTrigger, SidenavContent, SidenavItem, SidenavUserView,
  SidenavSubheader, SidenavDivider, SidenavCollapsible, SidenavClose,
} from "@/components/ui/sidenav";`}
        />
        <CodeBlock
          className="mt-3"
          code={`<Sidenav>
  <SidenavTrigger asChild><Button variant="flat">Menu</Button></SidenavTrigger>
  <SidenavContent label="Main navigation">
    <SidenavItem href="/inbox" icon={<MaterialIcon name="inbox" />} active>Inbox</SidenavItem>
    <SidenavDivider />
    <SidenavSubheader>More</SidenavSubheader>
    <SidenavItem href="/settings">Settings</SidenavItem>
  </SidenavContent>
</Sidenav>`}
        />
        <p>
          Every part renders a list item, so the content is a real <code>&lt;nav&gt;</code> with a{" "}
          <code>&lt;ul&gt;</code> inside. Use <code>asChild</code> on <code>SidenavItem</code> to render your router&apos;s
          link component.
        </p>
      </DocSection>

      <DocSection title="Touch gestures">
        <p>
          On touch screens, swipe in from the screen edge to open the drawer and drag it back to close it. Release past
          20% of its width (or flick it) and it finishes the move. Otherwise it springs back. The gesture uses Pointer
          Events with <code>touch-action: pan-y</code>, so vertical scrolling inside the drawer still works. Turn it off
          with <code>draggable={"{false}"}</code>. When the user prefers reduced motion, the drawer still follows the
          finger, but it snaps into place without animating.
        </p>
        <Callout tone="info">
          Each draggable sidenav listens on a 10px strip at its screen edge while it is closed. If a page has more than
          one sidenav on the same edge, keep <code>draggable</code> on just one of them.
        </Callout>
      </DocSection>

      <DocSection title="Right edge">
        <p>
          <code>edge=&quot;right&quot;</code> slides the drawer in from the right. <code>closeOnClick</code> closes it
          when a link inside it is clicked, and <code>SidenavClose</code> wraps any closing control.
        </p>
        <ComponentPreview name="sidenav-right">
          <SidenavRight />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Fixed sidenav">
        <p>
          <code>variant=&quot;fixed&quot;</code> shows a permanent <code>&lt;nav&gt;</code> from <code>breakpoint</code>{" "}
          (<code>md</code>, <code>lg</code> or <code>xl</code>) up, and the modal drawer below it. This is done with CSS,
          so nothing flashes during server rendering. Hide the trigger at the same breakpoint (<code>lg:hidden</code>).
          The fixed panel is a normal flex item. Add <code>className=&quot;fixed inset-y-0 left-0&quot;</code> to pin it
          to the viewport, like Materialize&apos;s <code>.sidenav-fixed</code>.
        </p>
        <ComponentPreview name="sidenav-fixed" align="start">
          <SidenavFixed />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Sidenav"
          props={[
            { name: "open", type: "boolean", description: "Controlled open state of the drawer." },
            { name: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
            { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the drawer opens or closes." },
            { name: "edge", type: '"left" | "right"', default: '"left"', description: "Screen edge the drawer slides in from." },
            { name: "draggable", type: "boolean", default: "true", description: "Edge swipe to open and drag to close (touch and pen)." },
          ]}
        />
        <PropsTable
          title="SidenavContent"
          props={[
            { name: "label", type: "string", default: '"Navigation"', description: "Accessible name of the dialog and the nav landmark." },
            { name: "variant", type: '"modal" | "fixed"', default: '"modal"', description: "Drawer only, or a permanent nav from a breakpoint up." },
            { name: "breakpoint", type: '"md" | "lg" | "xl"', default: '"lg"', description: "Where a fixed sidenav becomes permanent." },
            { name: "closeOnClick", type: "boolean", default: "false", description: "Close the drawer when a link inside it is clicked." },
            { name: "overlayClassName", type: "string", description: "Classes for the overlay." },
          ]}
        />
        <PropsTable
          title="SidenavItem"
          props={[
            { name: "icon", type: "ReactNode", description: "Leading icon, shown at 54% opacity." },
            { name: "active", type: "boolean", default: "false", description: 'Highlight the item and set aria-current="page".' },
            { name: "asChild", type: "boolean", default: "false", description: "Render the child element (e.g. a router Link)." },
          ]}
        />
        <PropsTable
          title="SidenavUserView"
          props={[
            { name: "background", type: "string | ReactNode", description: "Background image URL or node." },
            { name: "avatar", type: "string | ReactNode", description: "64px circular avatar." },
            { name: "avatarAlt", type: "string", default: '""', description: "Alt text for a string avatar." },
            { name: "name / email", type: "ReactNode", description: "White text lines." },
          ]}
        />
        <PropsTable
          title="SidenavCollapsible"
          props={[
            { name: "title", type: "ReactNode", description: "Disclosure button label." },
            { name: "icon", type: "ReactNode", description: "Leading icon." },
            { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Expanded state." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            The drawer is a modal <code>role=&quot;dialog&quot;</code> named by <code>label</code>, and it contains a{" "}
            <code>&lt;nav&gt;</code> landmark. Focus is trapped while it is open.
          </li>
          <li>
            <kbd>Escape</kbd> or a click on the overlay closes it, and focus returns to the trigger.
          </li>
          <li>
            Collapsible groups are disclosure buttons with <code>aria-expanded</code>. The active link has{" "}
            <code>aria-current=&quot;page&quot;</code>.
          </li>
          <li>Slide animations are turned off when the user prefers reduced motion.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
