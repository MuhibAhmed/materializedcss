import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { DropdownMenuAdvanced } from "~/registry/examples/dropdown-menu-advanced";
import { DropdownMenuBelow } from "~/registry/examples/dropdown-menu-below";
import { DropdownMenuDemo } from "~/registry/examples/dropdown-menu-demo";
import { DropdownMenuHover } from "~/registry/examples/dropdown-menu-hover";
import { DropdownMenuOverflow } from "~/registry/examples/dropdown-menu-overflow";

export const metadata: Metadata = { title: "Dropdown Menu" };

export default function DropdownMenuPage(): React.JSX.Element {
  return (
    <ComponentDoc name="dropdown-menu">
      <ComponentPreview name="dropdown-menu-demo">
        <DropdownMenuDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="dropdown-menu" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";`}
        />
        <CodeBlock
          className="mt-3"
          code={`<DropdownMenu>
  <DropdownMenuTrigger asChild><Button>Drop me!</Button></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={() => {}}>one</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>two</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
        />
      </DocSection>

      <DocSection title="Placement">
        <p>
          Like Materialize, a menu opens over its trigger by default (<code>coverTrigger</code>). Set{" "}
          <code>coverTrigger={"{false}"}</code> to open it below the trigger. Use <code>align</code> (
          <code>start</code>, <code>center</code>, <code>end</code>) to line it up, and <code>constrainWidth</code> to
          match the trigger&apos;s width. If there is not enough room, the menu flips or shifts to stay on screen.
        </p>
        <ComponentPreview name="dropdown-menu-below">
          <DropdownMenuBelow />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Hover">
        <p>
          <code>hover</code> opens the menu when the mouse rests on the trigger and closes it shortly after the mouse
          leaves. Keyboard, touch and click still work. Tune the timing with <code>openDelay</code> and{" "}
          <code>closeDelay</code>.
        </p>
        <ComponentPreview name="dropdown-menu-hover">
          <DropdownMenuHover />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Submenus, checkboxes and radios">
        <p>
          New compared with Materialize: labels, keyboard shortcut hints, nested submenus, and checkbox and radio items
          with controlled state.
        </p>
        <ComponentPreview name="dropdown-menu-advanced">
          <DropdownMenuAdvanced />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Inside overflow containers">
        <p>
          The menu renders in a portal and is positioned with collision detection. A parent with{" "}
          <code>overflow: hidden</code> or a scroll container cannot clip it, which was a common Materialize problem.
        </p>
        <ComponentPreview name="dropdown-menu-overflow">
          <DropdownMenuOverflow />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="DropdownMenu"
          props={[
            { name: "open / defaultOpen", type: "boolean", description: "Controlled / initial open state." },
            { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the menu opens or closes." },
            { name: "hover", type: "boolean", default: "false", description: "Open on mouse hover (Materialize hover option)." },
            { name: "openDelay", type: "number", default: "100", description: "Hover delay before opening, in ms." },
            { name: "closeDelay", type: "number", default: "225", description: "Delay before closing after the pointer leaves, in ms." },
            { name: "modal", type: "boolean", default: "true", description: "Block outside interaction while open (hover menus are never modal)." },
          ]}
        />
        <PropsTable
          title="DropdownMenuContent"
          props={[
            { name: "coverTrigger", type: "boolean", default: "true", description: "Open over the trigger instead of below it." },
            { name: "constrainWidth", type: "boolean", default: "false", description: "Make the menu as wide as the trigger." },
            { name: "align", type: '"start" | "center" | "end"', default: '"start"', description: "Alignment against the trigger." },
            { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "Preferred side. It flips when there is no room." },
            { name: "sideOffset", type: "number", description: "Distance from the trigger. Overrides coverTrigger." },
            { name: "collisionPadding", type: "number", default: "8", description: "Minimum distance from the viewport edges." },
          ]}
        />
        <PropsTable
          title="Items"
          props={[
            { name: "DropdownMenuItem", type: "onSelect, disabled, inset, destructive", description: "A menu action. Put an icon first." },
            { name: "DropdownMenuCheckboxItem", type: "checked, onCheckedChange", description: "Toggle item." },
            { name: "DropdownMenuRadioGroup / RadioItem", type: "value, onValueChange / value", description: "Single choice." },
            { name: "DropdownMenuSub / SubTrigger / SubContent", type: "open, onOpenChange", description: "Nested menu." },
            { name: "DropdownMenuLabel / Separator / Shortcut / Group", type: "—", description: "Structure and hints." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            The trigger has <code>aria-haspopup=&quot;menu&quot;</code> and <code>aria-expanded</code>. The menu uses{" "}
            <code>role=&quot;menu&quot;</code>, <code>menuitem</code>, <code>menuitemcheckbox</code> and{" "}
            <code>menuitemradio</code>.
          </li>
          <li>
            <kbd>Enter</kbd>, <kbd>Space</kbd> or <kbd>ArrowDown</kbd> opens the menu. <kbd>ArrowUp</kbd> and{" "}
            <kbd>ArrowDown</kbd> move between items, <kbd>Home</kbd> and <kbd>End</kbd> jump to the ends, and typing a
            letter jumps to a matching item.
          </li>
          <li>
            <kbd>ArrowRight</kbd> opens a submenu and <kbd>ArrowLeft</kbd> closes it. <kbd>Escape</kbd> closes the menu
            and returns focus to the trigger.
          </li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
