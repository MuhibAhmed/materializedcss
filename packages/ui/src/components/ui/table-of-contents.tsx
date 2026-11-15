"use client";

import * as React from "react";

import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";

export interface TableOfContentsItem {
  /** Id of the section element this link points to. */
  id: string;
  /** Link text. */
  label: React.ReactNode;
  /** Nesting level, indents the link. Default `1`. */
  level?: 1 | 2 | 3;
}

export interface TableOfContentsProps extends Omit<React.ComponentProps<"nav">, "children"> {
  /** Sections to link to, in document order. */
  items: TableOfContentsItem[];
  /** Distance in px from the top of the viewport (or `root`) at which a section becomes active. Default `200`. */
  scrollOffset?: number;
  /** Scrolling element that contains the sections. Defaults to the page. */
  root?: Element | null;
  /** Called when the active section changes. */
  onActiveChange?: (id: string | null) => void;
}

const levelIndent: Record<1 | 2 | 3, string> = { 1: "pl-4", 2: "pl-8", 3: "pl-12" };

/**
 * List of links to the sections of a page that highlights the section being
 * read (Materialize scrollspy + `.table-of-contents`). Clicking a link scrolls
 * smoothly (instantly with reduced motion) and moves focus to the section.
 */
export function TableOfContents({
  items,
  scrollOffset = 200,
  root = null,
  onActiveChange,
  className,
  "aria-label": ariaLabel = "Table of contents",
  ...props
}: TableOfContentsProps): React.JSX.Element {
  const ids = React.useMemo(() => items.map((item) => item.id), [items]);
  const activeId = useScrollSpy(ids, { scrollOffset, root });
  const reducedMotion = usePrefersReducedMotion();

  const onActiveChangeRef = React.useRef(onActiveChange);
  React.useEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  });
  React.useEffect(() => {
    onActiveChangeRef.current?.(activeId);
  }, [activeId]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string): void => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    // scrollIntoView honours `scroll-margin-top` on the section (and `scroll-padding-top` on the scroller).
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    if (!root) window.history.pushState(null, "", `#${id}`);
    if (!target.matches("a[href], button, input, select, textarea, [tabindex]")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  return (
    <nav data-slot="table-of-contents" aria-label={ariaLabel} className={cn("text-sm", className)} {...props}>
      <ul data-slot="table-of-contents-list" className="m-0 flex list-none flex-col gap-0.5 p-0">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id} data-slot="table-of-contents-item" className="m-0 p-0">
              <a
                href={`#${item.id}`}
                data-slot="table-of-contents-link"
                data-active={active || undefined}
                aria-current={active ? "location" : undefined}
                onClick={(event) => handleClick(event, item.id)}
                className={cn(
                  "block rounded-r-sm border-l py-1 pr-2 leading-6 transition-colors outline-none focus-visible:focus-ring",
                  levelIndent[item.level ?? 1],
                  active
                    ? "border-l-2 border-primary font-medium text-foreground"
                    : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
                  // Keep the text aligned when the active border grows from 1px to 2px.
                  active && "-indent-px",
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
