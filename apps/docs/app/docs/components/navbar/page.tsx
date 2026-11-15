import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { NavbarBrandPosition } from "~/registry/examples/navbar-brand-position";
import { NavbarDemo } from "~/registry/examples/navbar-demo";
import { NavbarExtendedDemo } from "~/registry/examples/navbar-extended-demo";
import { NavbarFixed } from "~/registry/examples/navbar-fixed";
import { NavbarIcons } from "~/registry/examples/navbar-icons";
import { NavbarSearchDemo } from "~/registry/examples/navbar-search-demo";

export const metadata: Metadata = { title: "Navbar" };

export default function NavbarPage(): React.JSX.Element {
  return (
    <ComponentDoc name="navbar">
      <ComponentPreview name="navbar-demo" bleed align="start" className="min-h-0">
        <NavbarDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="navbar" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarLink, NavbarNav } from "@/components/ui/navbar";`}
        />
        <CodeBlock
          className="mt-3"
          code={`<Navbar>
  <NavbarContent>
    <NavbarBrand href="/">Logo</NavbarBrand>
    <NavbarNav aria-label="Main">
      <NavbarItem>
        <NavbarLink href="/components" active>Components</NavbarLink>
      </NavbarItem>
    </NavbarNav>
  </NavbarContent>
</Navbar>`}
        />
      </DocSection>

      <DocSection title="Logo position and mobile menu">
        <p>
          <code>NavbarBrand position</code> is <code>left</code>, <code>center</code> or <code>right</code>.{" "}
          <code>NavbarMenuButton</code> is the hamburger trigger for a side navigation: pass it the{" "}
          <code>aria-expanded</code> and <code>aria-controls</code> of your <Link href="/docs/components/sidenav" className="underline">Sidenav</Link>,
          and hide it on large screens with <code>className=&quot;lg:hidden&quot;</code> when the links are visible there.
        </p>
        <ComponentPreview name="navbar-brand-position" align="start">
          <NavbarBrandPosition />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Icons and buttons">
        <p>
          Icon-only links need an <code>aria-label</code>. Buttons placed in a <code>NavbarItem</code> get Materialize&apos;s
          15px side margins. A dropdown trigger can go in a <code>NavbarItem</code> the same way.
        </p>
        <ComponentPreview name="navbar-icons" align="start">
          <NavbarIcons />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Extended">
        <p>
          <code>NavbarExtended</code> adds a second row for a large <code>NavbarTitle</code>, tabs or a floating action
          button.
        </p>
        <ComponentPreview name="navbar-extended-demo" bleed align="start" className="min-h-0 pb-10">
          <NavbarExtendedDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Fixed">
        <p>
          <code>fixed</code> keeps the navbar at the top while the page scrolls. It uses <code>position: sticky</code>, so
          no spacer element is needed.
        </p>
        <ComponentPreview name="navbar-fixed" bleed align="start" className="min-h-0">
          <NavbarFixed />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Search">
        <p>
          <code>NavbarSearch</code> fills the bar with a labelled search field. It turns white while focused; the close
          button (or Escape) clears it, and on an empty field calls <code>onClose</code> so you can hide it.
        </p>
        <ComponentPreview name="navbar-search-demo" align="start">
          <NavbarSearchDemo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable title="Navbar" props={[{ name: "fixed", type: "boolean", default: "false", description: "Stick to the top while scrolling." }]} />
        <PropsTable
          title="NavbarBrand"
          props={[
            { name: "position", type: '"left" | "center" | "right"', default: '"left"', description: "Where the logo sits." },
            { name: "asChild", type: "boolean", default: "false", description: "Render the child element (e.g. a router link)." },
          ]}
        />
        <PropsTable
          title="NavbarNav"
          props={[
            { name: "aria-label", type: "string", description: "Name of the navigation landmark." },
            { name: "align", type: '"start" | "end"', default: '"end"', description: "Push the links to the end of the bar." },
          ]}
        />
        <PropsTable
          title="NavbarLink"
          props={[
            { name: "active", type: "boolean", default: "false", description: "Current page: tinted with aria-current=\"page\"." },
            { name: "asChild", type: "boolean", default: "false", description: "Render the child element (e.g. a router link)." },
          ]}
        />
        <PropsTable
          title="NavbarSearch"
          props={[
            { name: "value / defaultValue", type: "string", description: "Controlled or initial query." },
            { name: "onValueChange", type: "(value: string) => void", description: "Called on every change." },
            { name: "onSearch", type: "(value: string) => void", description: "Called on submit (Enter)." },
            { name: "onClose", type: "() => void", description: "Close pressed on an empty field." },
            { name: "label", type: "string", default: '"Search"', description: "Visually hidden label of the input." },
            { name: "clearLabel", type: "string", default: '"Clear search"', description: "Label of the close button." },
            { name: "inputProps", type: "ComponentProps<\"input\">", description: "Props for the input." },
          ]}
        />
        <PropsTable
          title="NavbarTitle"
          props={[{ name: "as", type: '"h1" | "h2" | "h3" | "div" | "span"', default: '"h1"', description: "Element to render." }]}
        />
        <PropsTable
          title="NavbarMenuButton"
          props={[{ name: "aria-label", type: "string", default: '"Open navigation menu"', description: "Accessible name." }]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            <code>Navbar</code> renders a <code>&lt;header&gt;</code>; links live in a <code>&lt;nav&gt;</code> landmark,
            so give each <code>NavbarNav</code> a distinct <code>aria-label</code>.
          </li>
          <li>The active link has <code>aria-current=&quot;page&quot;</code>.</li>
          <li>Focus rings are drawn in the bar&apos;s text color, so they are visible on the primary background.</li>
          <li>
            In <code>NavbarSearch</code>, <kbd>Enter</kbd> submits and <kbd>Escape</kbd> clears the query (or calls{" "}
            <code>onClose</code> when it is empty).
          </li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
