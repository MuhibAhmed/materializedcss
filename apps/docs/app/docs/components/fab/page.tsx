import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { Callout, DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { FabDemo } from "~/registry/examples/fab-demo";
import { FabDirections } from "~/registry/examples/fab-directions";
import { FabToolbar } from "~/registry/examples/fab-toolbar";

export const metadata: Metadata = { title: "Floating Action Button" };

export default function FabPage(): React.JSX.Element {
  return (
    <ComponentDoc name="fab">
      <ComponentPreview name="fab-demo">
        <FabDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="fab" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Fab, FabTrigger, FabActions, FabAction } from "@/components/ui/fab";`} />
        <CodeBlock
          className="mt-3"
          code={`<Fab>
  <FabTrigger aria-label="Edit options">
    <MaterialIcon name="mode_edit" />
  </FabTrigger>
  <FabActions>
    <FabAction label="Insert chart" color="primary"><MaterialIcon name="insert_chart" /></FabAction>
    <FabAction label="Publish" color="success"><MaterialIcon name="publish" /></FabAction>
  </FabActions>
</Fab>`}
        />
        <p>
          By default the button is fixed 23px from the bottom-right corner of the viewport, like Materialize&apos;s{" "}
          <code>.fixed-action-btn</code>. The examples on this page use <code>position=&quot;static&quot;</code> so they
          stay inside the preview. Moving the mouse over the button opens the actions. Clicking, tapping and the keyboard
          also work.
        </p>
        <Callout>
          The mini buttons only show icons, so each <code>FabAction</code> needs a <code>label</code>. It becomes the
          accessible name. Wrap actions in a <code>Tooltip</code> to show the label to sighted users too, as in the demo.
        </Callout>
      </DocSection>

      <DocSection title="Directions and click mode">
        <p>
          <code>direction</code> sets where the actions appear: <code>top</code> (default), <code>right</code>,{" "}
          <code>bottom</code> or <code>left</code>. Set <code>hoverEnabled={"{false}"}</code> to open only on click.
        </p>
        <ComponentPreview name="fab-directions">
          <FabDirections />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Toolbar">
        <p>
          With <code>toolbar</code>, the button expands into a full-width bar of actions with a circular reveal. A fixed
          toolbar spans the bottom of the viewport; a static one spans its nearest positioned parent.
        </p>
        <ComponentPreview name="fab-toolbar">
          <FabToolbar />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Fab"
          props={[
            { name: "open / defaultOpen", type: "boolean", description: "Controlled / initial open state." },
            { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the actions open or close." },
            { name: "direction", type: '"top" | "right" | "bottom" | "left"', default: '"top"', description: "Where the actions appear." },
            { name: "hoverEnabled", type: "boolean", default: "true", description: "Open on mouse hover. Ignored in toolbar mode." },
            { name: "toolbar", type: "boolean", default: "false", description: "Morph into a toolbar (Materialize toolbarEnabled)." },
            { name: "position", type: '"fixed" | "static"', default: '"fixed"', description: "Pinned to the viewport corner or in the normal flow." },
            { name: "color", type: '"primary" | "secondary" | "error" | "success" | "default"', default: '"primary"', description: "Color of the main button and the toolbar." },
          ]}
        />
        <PropsTable
          title="Parts"
          props={[
            { name: "FabTrigger", type: "ButtonProps & { 'aria-label': string }", description: "The large button. size defaults to lg." },
            { name: "FabActions", type: "ComponentProps<'div'>", description: "The menu (role=menu). Each child is wrapped in a role=none item." },
            { name: "FabAction", type: "ButtonProps & { label: string }", description: "A mini button. size defaults to md." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            The trigger follows the menu button pattern: <code>aria-haspopup=&quot;menu&quot;</code>,{" "}
            <code>aria-expanded</code> and <code>aria-controls</code>. The actions are <code>menuitem</code>s inside a{" "}
            <code>role=&quot;menu&quot;</code> list.
          </li>
          <li>
            <kbd>Enter</kbd>, <kbd>Space</kbd> or an arrow key opens the menu and focuses the nearest action. Arrow keys
            move between actions, <kbd>Home</kbd> and <kbd>End</kbd> jump to the ends, and <kbd>Escape</kbd> closes the
            menu and returns focus to the trigger. <kbd>Tab</kbd> closes it and moves on.
          </li>
          <li>A click outside, or focus leaving the component, closes the menu.</li>
          <li>The staggered animation is turned off when the user prefers reduced motion.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
