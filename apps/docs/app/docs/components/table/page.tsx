import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { TableDemo } from "~/registry/examples/table-demo";
import { TableResponsive } from "~/registry/examples/table-responsive";
import { TableVariants } from "~/registry/examples/table-variants";

export const metadata: Metadata = { title: "Table" };

export default function TablePage(): React.JSX.Element {
  return (
    <ComponentDoc name="table">
      <ComponentPreview name="table-demo">
        <TableDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="table" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";`}
        />
        <CodeBlock
          className="mt-3"
          code={`<Table striped>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Price</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Eclair</TableCell>
      <TableCell>$0.87</TableCell>
    </TableRow>
  </TableBody>
</Table>`}
        />
      </DocSection>

      <DocSection title="Striped, highlight and centered">
        <p>
          <code>striped</code> adds zebra rows, <code>highlight</code> tints rows on hover and <code>centered</code>{" "}
          centers every cell. They can be combined.
        </p>
      </DocSection>
      <ComponentPreview name="table-variants">
        <TableVariants />
      </ComponentPreview>

      <DocSection title="Responsive">
        <p>
          Tables are wrapped in a horizontally scrolling container by default (<code>responsive</code>). When a table can
          overflow, make the container focusable and name it with <code>containerProps</code> so keyboard users can
          scroll it. Materialize&apos;s flipped <code>.responsive-table</code> layout is intentionally not reproduced: it
          broke the reading order for screen readers.
        </p>
      </DocSection>
      <ComponentPreview name="table-responsive" align="start">
        <TableResponsive />
      </ComponentPreview>

      <DocSection title="API Reference">
        <PropsTable
          title="Table"
          props={[
            { name: "striped", type: "boolean", default: "false", description: "Zebra-striped body rows." },
            { name: "highlight", type: "boolean", default: "false", description: "Highlight body rows on hover." },
            { name: "centered", type: "boolean", default: "false", description: "Center all cell text." },
            { name: "responsive", type: "boolean", default: "true", description: "Wrap in a horizontal scroll container." },
            { name: "containerProps", type: "ComponentProps<\"div\">", description: "Props for the scroll container." },
          ]}
        />
        <p>
          <code>TableHeader</code>, <code>TableBody</code>, <code>TableFooter</code>, <code>TableRow</code>,{" "}
          <code>TableHead</code> (defaults to <code>scope=&quot;col&quot;</code>), <code>TableCell</code> and{" "}
          <code>TableCaption</code> render their native elements and forward all props.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>Uses native table elements, so screen readers can navigate by row and column.</li>
          <li>
            Use <code>TableHead scope=&quot;row&quot;</code> for row headers, and a <code>TableCaption</code> to describe
            the table.
          </li>
          <li>
            A scrollable container with <code>tabIndex={"{0}"}</code> and an <code>aria-label</code> can be scrolled with
            the arrow keys.
          </li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
