import * as React from "react";
import { Slot } from "radix-ui";

import { ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface BreadcrumbsProps extends React.ComponentProps<"nav"> {
  /** Accessible name of the landmark. */
  "aria-label"?: string;
}

/**
 * Breadcrumb trail (Materialize `.breadcrumb`). Inherits the text color, so it
 * works inside a `Navbar` or on its own. Renders `<nav aria-label="Breadcrumb">`.
 */
export function Breadcrumbs({ className, "aria-label": ariaLabel = "Breadcrumb", ...props }: BreadcrumbsProps): React.JSX.Element {
  return <nav data-slot="breadcrumbs" aria-label={ariaLabel} className={cn("text-lg", className)} {...props} />;
}

/** Ordered list of crumbs. */
export function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">): React.JSX.Element {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn("m-0 flex list-none flex-wrap items-center gap-y-1 p-0 break-words", className)}
      {...props}
    />
  );
}

/** One crumb. */
export function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">): React.JSX.Element {
  return <li data-slot="breadcrumb-item" className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

export interface BreadcrumbLinkProps extends React.ComponentProps<"a"> {
  /** Render the child element (e.g. Next.js `Link`) instead of an `<a>`. */
  asChild?: boolean;
}

/** Link to an ancestor page. */
export function BreadcrumbLink({ className, asChild = false, ...props }: BreadcrumbLinkProps): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "a";
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-ui text-inherit no-underline outline-none transition-opacity hover:underline hover:underline-offset-4 focus-visible:focus-ring",
        "[&_svg]:size-6 [&_.material-icons]:text-2xl",
        className,
      )}
      {...props}
    />
  );
}

/** The current page: the last crumb, with `aria-current="page"`. */
export function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">): React.JSX.Element {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn("inline-flex items-center gap-1.5 font-medium [&_svg]:size-6 [&_.material-icons]:text-2xl", className)}
      {...props}
    />
  );
}

/** Chevron between crumbs. Decorative: hidden from assistive technology. */
export function BreadcrumbSeparator({ className, children, ...props }: React.ComponentProps<"li">): React.JSX.Element {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("mx-1.5 inline-flex items-center opacity-70 [&_svg]:size-6", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  );
}
