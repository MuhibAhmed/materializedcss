"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { useControllableState } from "@/hooks/use-controllable-state";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface PaginationProps extends React.ComponentProps<"nav"> {
  /** Accessible name of the navigation landmark. */
  "aria-label"?: string;
}

/** Page navigation (Materialize `.pagination`). Renders `<nav aria-label="Pagination">`. */
export function Pagination({ className, "aria-label": ariaLabel = "Pagination", ...props }: PaginationProps): React.JSX.Element {
  return <nav data-slot="pagination" aria-label={ariaLabel} className={cn("text-foreground", className)} {...props} />;
}

/** The list of pages. */
export function PaginationList({ className, ...props }: React.ComponentProps<"ul">): React.JSX.Element {
  return (
    <ul
      data-slot="pagination-list"
      className={cn("m-0 flex list-none flex-wrap items-center gap-0.5 p-0", className)}
      {...props}
    />
  );
}

/** One entry of the list. */
export function PaginationItem({ className, ...props }: React.ComponentProps<"li">): React.JSX.Element {
  return <li data-slot="pagination-item" className={cn("inline-flex list-none", className)} {...props} />;
}

const linkBase = [
  "inline-flex h-[30px] min-w-[30px] cursor-pointer select-none items-center justify-center rounded-ui border-0 bg-transparent px-2.5",
  "text-[1.2rem] leading-[30px] text-foreground no-underline outline-none transition-colors duration-200",
  "hover:bg-surface-hover focus-visible:focus-ring",
  "aria-disabled:pointer-events-none aria-disabled:cursor-default aria-disabled:text-disabled-foreground",
  "disabled:pointer-events-none disabled:cursor-default disabled:text-disabled-foreground",
  "[&_svg]:size-8 [&_svg]:shrink-0",
].join(" ");

interface PaginationLinkBaseProps {
  /** Marks the current page: secondary background and `aria-current="page"`. */
  isActive?: boolean;
  /** Disable the control. Links get `aria-disabled` and lose their `href`; buttons stay focusable via `aria-disabled`. */
  disabled?: boolean;
  /** Render the child element (e.g. Next.js `Link`) instead of the default element. */
  asChild?: boolean;
}

export type PaginationLinkProps = PaginationLinkBaseProps &
  (
    | (Omit<React.ComponentProps<"a">, "href"> & { href: string })
    | (React.ComponentProps<"button"> & { href?: undefined })
  );

/**
 * A page number (or any pagination control). Renders `<a>` when `href` is
 * given, otherwise a `<button>`.
 */
export function PaginationLink({ className, isActive = false, disabled = false, asChild = false, ...props }: PaginationLinkProps): React.JSX.Element {
  const classes = cn(
    linkBase,
    isActive && "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
    className,
  );
  const common = {
    "data-slot": "pagination-link",
    "data-active": isActive ? "" : undefined,
    "aria-current": isActive ? ("page" as const) : undefined,
    "aria-disabled": disabled ? true : undefined,
    className: classes,
  };

  if (asChild) {
    const { href: _href, ...rest } = props as React.ComponentProps<"a">;
    return <Slot.Root {...common} {...(rest as React.HTMLAttributes<HTMLElement>)} />;
  }

  if (props.href !== undefined) {
    const { href, onClick, ...rest } = props as React.ComponentProps<"a"> & { href: string };
    return (
      <a
        {...common}
        href={disabled ? undefined : href}
        role={disabled ? "link" : undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        {...rest}
      />
    );
  }

  const { onClick, type, ...rest } = props as React.ComponentProps<"button">;
  return (
    <button
      {...common}
      type={type ?? "button"}
      onClick={(event) => {
        // aria-disabled (not `disabled`) keeps focus on the control when it becomes unavailable.
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...rest}
    />
  );
}

/** Link to the previous page with a chevron. Labelled "Previous page" by default. */
export function PaginationPrevious({ "aria-label": ariaLabel = "Previous page", children, ...props }: PaginationLinkProps): React.JSX.Element {
  return (
    <PaginationLink data-slot="pagination-previous" aria-label={ariaLabel} {...(props as PaginationLinkProps)} className={cn("px-0", props.className)}>
      {children ?? <ChevronLeftIcon />}
    </PaginationLink>
  );
}

/** Link to the next page with a chevron. Labelled "Next page" by default. */
export function PaginationNext({ "aria-label": ariaLabel = "Next page", children, ...props }: PaginationLinkProps): React.JSX.Element {
  return (
    <PaginationLink data-slot="pagination-next" aria-label={ariaLabel} {...(props as PaginationLinkProps)} className={cn("px-0", props.className)}>
      {children ?? <ChevronRightIcon />}
    </PaginationLink>
  );
}

/** "…" placeholder for skipped pages. Hidden from screen readers. */
export function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">): React.JSX.Element {
  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden="true"
      className={cn("inline-flex h-[30px] min-w-[30px] items-center justify-center text-[1.2rem] text-muted-foreground", className)}
      {...props}
    >
      …
    </span>
  );
}

export type PaginationRangeItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * Compute the visible pages: always the first/last `boundaryCount` pages, the
 * current page with `siblingCount` neighbours, and ellipses for the gaps. The
 * result always has the same length for a given `total` so controls don't jump.
 */
export function getPaginationRange(page: number, total: number, siblingCount = 1, boundaryCount = 1): PaginationRangeItem[] {
  const range = (start: number, end: number): number[] =>
    end < start ? [] : Array.from({ length: end - start + 1 }, (_, index) => start + index);

  const startPages = range(1, Math.min(boundaryCount, total));
  const endPages = range(Math.max(total - boundaryCount + 1, boundaryCount + 1), total);

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, total - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? (endPages[0] ?? total) - 2 : total - 1,
  );

  const items: PaginationRangeItem[] = [...startPages];
  if (siblingsStart > boundaryCount + 2) items.push("ellipsis-start");
  else if (boundaryCount + 1 < total - boundaryCount) items.push(boundaryCount + 1);
  items.push(...range(siblingsStart, siblingsEnd));
  if (siblingsEnd < total - boundaryCount - 1) items.push("ellipsis-end");
  else if (total - boundaryCount > boundaryCount) items.push(total - boundaryCount);
  items.push(...endPages);

  // Remove duplicates that can appear for very small totals.
  return items.filter((item, index) => typeof item !== "number" || items.indexOf(item) === index).filter(
    (item) => typeof item !== "number" || (item >= 1 && item <= total),
  );
}

export interface PaginationControlProps extends Omit<React.ComponentProps<"nav">, "onChange"> {
  /** Current page (1-based, controlled). */
  page?: number | undefined;
  /** Initial page when uncontrolled. */
  defaultPage?: number | undefined;
  /** Total number of pages. */
  total: number;
  /** Called with the new page number. */
  onPageChange?: ((page: number) => void) | undefined;
  /** Pages shown on each side of the current page. */
  siblingCount?: number;
  /** Pages always shown at the start and end. */
  boundaryCount?: number;
  /** Build an `href` for each page to render real links (e.g. `?page=3`) instead of buttons. */
  getHref?: ((page: number) => string) | undefined;
  /** Accessible label for a page number (default `"Page 3"`). The current page also gets `aria-current="page"`. */
  getPageLabel?: ((page: number) => string) | undefined;
  /** Accessible name of the navigation landmark. */
  "aria-label"?: string;
}

/**
 * Ready-made pagination: computes the visible range with ellipses and renders
 * previous/next chevrons. Works controlled (`page`) or uncontrolled (`defaultPage`).
 */
export function PaginationControl({
  page: pageProp,
  defaultPage = 1,
  total,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  getHref,
  getPageLabel = (page) => `Page ${page}`,
  ...props
}: PaginationControlProps): React.JSX.Element {
  const pageCount = Math.max(1, Math.floor(total));
  const [rawPage, setPage] = useControllableState({ value: pageProp, defaultValue: defaultPage, onChange: onPageChange });
  const page = Math.min(Math.max(1, rawPage), pageCount);
  const items = getPaginationRange(page, pageCount, siblingCount, boundaryCount);

  const go = (target: number): void => {
    const next = Math.min(Math.max(1, target), pageCount);
    if (next !== page) setPage(next);
  };

  const linkProps = (target: number): { href: string } | Record<string, never> =>
    getHref ? { href: getHref(target) } : {};

  return (
    <Pagination {...props}>
      <PaginationList>
        <PaginationItem>
          <PaginationPrevious
            {...linkProps(page - 1)}
            disabled={page <= 1}
            onClick={(event: React.MouseEvent) => {
              if (!getHref) event.preventDefault();
              go(page - 1);
            }}
          />
        </PaginationItem>
        {items.map((item) =>
          typeof item === "number" ? (
            <PaginationItem key={item}>
              <PaginationLink
                {...linkProps(item)}
                isActive={item === page}
                aria-label={getPageLabel(item)}
                onClick={(event: React.MouseEvent) => {
                  if (!getHref) event.preventDefault();
                  go(item);
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationEllipsis />
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            {...linkProps(page + 1)}
            disabled={page >= pageCount}
            onClick={(event: React.MouseEvent) => {
              if (!getHref) event.preventDefault();
              go(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationList>
    </Pagination>
  );
}
