import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { PaginationControlled } from "~/registry/examples/pagination-controlled";
import { PaginationDemo } from "~/registry/examples/pagination-demo";
import { PaginationLinks } from "~/registry/examples/pagination-links";

export const metadata: Metadata = { title: "Pagination" };

export default function PaginationPage(): React.JSX.Element {
  return (
    <ComponentDoc name="pagination">
      <ComponentPreview name="pagination-demo">
        <PaginationDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="pagination" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { PaginationControl } from "@/components/ui/pagination";`} />
        <CodeBlock className="mt-3" code={`<PaginationControl page={page} total={20} onPageChange={setPage} />`} />
        <p>
          Or compose <code>Pagination</code>, <code>PaginationList</code>, <code>PaginationItem</code>,{" "}
          <code>PaginationLink</code>, <code>PaginationPrevious</code>, <code>PaginationNext</code> and{" "}
          <code>PaginationEllipsis</code> yourself, as in the example above.
        </p>
      </DocSection>

      <DocSection title="Pagination control">
        <p>
          <code>PaginationControl</code> computes which pages to show: always the first and last page, the current page
          with <code>siblingCount</code> neighbours, and ellipses for the gaps. The number of slots stays constant, so the
          controls don&apos;t jump around as you click.
        </p>
        <ComponentPreview name="pagination-controlled">
          <PaginationControlled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Links">
        <p>
          Pass <code>getHref</code> to render real links (crawlable, open in a new tab), for example{" "}
          <code>{"(page) => `/blog?page=${page}`"}</code>. Without it the control renders buttons.
        </p>
        <ComponentPreview name="pagination-links">
          <PaginationLinks />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="PaginationControl"
          props={[
            { name: "total", type: "number", description: "Number of pages (required)." },
            { name: "page", type: "number", description: "Current page, 1-based (controlled)." },
            { name: "defaultPage", type: "number", default: "1", description: "Initial page when uncontrolled." },
            { name: "onPageChange", type: "(page: number) => void", description: "Called with the new page." },
            { name: "siblingCount", type: "number", default: "1", description: "Pages on each side of the current page." },
            { name: "boundaryCount", type: "number", default: "1", description: "Pages always shown at each end." },
            { name: "getHref", type: "(page: number) => string", description: "Render links instead of buttons." },
            { name: "getPageLabel", type: "(page: number) => string", default: '"Page N"', description: "Accessible name of a page number." },
          ]}
        />
        <PropsTable
          title="PaginationLink / PaginationPrevious / PaginationNext"
          props={[
            { name: "href", type: "string", description: "Render an <a>; without it a <button>." },
            { name: "isActive", type: "boolean", default: "false", description: "Current page: highlighted with aria-current=\"page\"." },
            { name: "disabled", type: "boolean", default: "false", description: "Unavailable (aria-disabled, stays focusable for buttons)." },
            { name: "asChild", type: "boolean", default: "false", description: "Render the child element (e.g. a router link)." },
          ]}
        />
        <p>
          <code>getPaginationRange(page, total, siblingCount, boundaryCount)</code> is exported for custom layouts.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            Renders <code>&lt;nav aria-label=&quot;Pagination&quot;&gt;</code>; use a distinct label when a page has several.
          </li>
          <li>The current page has <code>aria-current=&quot;page&quot;</code>; page numbers are named &quot;Page N&quot;.</li>
          <li>Chevrons are labelled &quot;Previous page&quot; and &quot;Next page&quot;.</li>
          <li>
            <kbd>Tab</kbd> moves between controls; <kbd>Enter</kbd> (and <kbd>Space</kbd> for buttons) activates them.
            Disabled chevrons use <code>aria-disabled</code>, so focus is not lost on the first or last page.
          </li>
          <li>Ellipses are hidden from assistive technology.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
