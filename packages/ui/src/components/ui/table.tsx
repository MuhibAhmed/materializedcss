import * as React from "react";

import { cn } from "@/lib/utils";

export interface TableProps extends React.ComponentProps<"table"> {
  /** Zebra stripes on body rows (Materialize `.striped`). */
  striped?: boolean;
  /** Highlight body rows on hover (Materialize `.highlight`). */
  highlight?: boolean;
  /** Center the text of every cell (Materialize `.centered`). */
  centered?: boolean;
  /**
   * Wrap the table in a horizontally scrolling container so wide tables never
   * break the layout on small screens. Defaults to `true`.
   */
  responsive?: boolean;
  /**
   * Props for the scroll container (when `responsive`). If the table can overflow,
   * pass `tabIndex: 0` and an `aria-label` so keyboard users can scroll it.
   */
  containerProps?: React.ComponentProps<"div">;
}

/**
 * Data table (Materialize `table`): borderless cells with row dividers and
 * optional stripes, hover highlight, centered text and a scroll container.
 */
export function Table({
  className,
  striped = false,
  highlight = false,
  centered = false,
  responsive = true,
  containerProps,
  ...props
}: TableProps): React.JSX.Element {
  const table = (
    <table
      data-slot="table"
      data-striped={striped ? "" : undefined}
      data-highlight={highlight ? "" : undefined}
      data-centered={centered ? "" : undefined}
      className={cn(
        "w-full border-collapse border-spacing-0 text-left text-foreground",
        striped && "[&>tbody>tr]:border-b-0 [&>tbody>tr:nth-child(odd)]:bg-surface-hover/50",
        highlight && "[&>tbody>tr]:transition-colors [&>tbody>tr]:duration-250 [&>tbody>tr:hover]:bg-surface-hover",
        centered && "text-center [&_td]:text-center [&_th]:text-center",
        className,
      )}
      {...props}
    />
  );
  if (!responsive) return table;
  return (
    <div
      data-slot="table-container"
      role={containerProps?.["aria-label"] ? "region" : undefined}
      {...containerProps}
      className={cn("relative w-full min-w-0 overflow-x-auto outline-none focus-visible:focus-ring", containerProps?.className)}
    >
      {table}
    </div>
  );
}

/** `<thead>`. */
export function TableHeader({ className, ...props }: React.ComponentProps<"thead">): React.JSX.Element {
  return <thead data-slot="table-header" className={cn(className)} {...props} />;
}

/** `<tbody>`. */
export function TableBody({ className, ...props }: React.ComponentProps<"tbody">): React.JSX.Element {
  return <tbody data-slot="table-body" className={cn(className)} {...props} />;
}

/** `<tfoot>`: totals or summaries, with a stronger top border. */
export function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">): React.JSX.Element {
  return <tfoot data-slot="table-footer" className={cn("border-t-2 border-border font-medium", className)} {...props} />;
}

/** `<tr>` with a 1px divider. */
export function TableRow({ className, ...props }: React.ComponentProps<"tr">): React.JSX.Element {
  return (
    <tr
      data-slot="table-row"
      className={cn("border-b border-border data-[state=selected]:bg-surface-active", className)}
      {...props}
    />
  );
}

/** Header cell (`<th>`). Defaults to `scope="col"`. */
export function TableHead({ className, scope = "col", ...props }: React.ComponentProps<"th">): React.JSX.Element {
  return (
    <th
      data-slot="table-head"
      scope={scope}
      className={cn("whitespace-nowrap rounded-ui px-[5px] py-[15px] align-middle font-bold [text-align:inherit]", className)}
      {...props}
    />
  );
}

/** Body cell (`<td>`). */
export function TableCell({ className, ...props }: React.ComponentProps<"td">): React.JSX.Element {
  return <td data-slot="table-cell" className={cn("rounded-ui px-[5px] py-[15px] align-middle", className)} {...props} />;
}

/** `<caption>`: a short description of the table, read first by screen readers. */
export function TableCaption({ className, ...props }: React.ComponentProps<"caption">): React.JSX.Element {
  return (
    <caption data-slot="table-caption" className={cn("caption-bottom py-3 text-sm text-muted-foreground", className)} {...props} />
  );
}
