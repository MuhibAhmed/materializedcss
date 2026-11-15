"use client";

import * as React from "react";

export interface UseScrollSpyOptions {
  /**
   * Distance in px from the top of the viewport (or `root`) of the activation line.
   * A section becomes active once its top scrolls above this line. Default `200`.
   */
  scrollOffset?: number;
  /** Scrolling element to watch. Defaults to the viewport. */
  root?: Element | null;
}

/**
 * Track which of the elements with the given ids is currently being read
 * (Materialize scrollspy). Returns the id of the last section whose top has
 * scrolled above the activation line, or `null` before the first one does.
 *
 * An IntersectionObserver whose `rootMargin` shrinks the root to a 1px line at
 * `scrollOffset` fires whenever a section enters or leaves that line, so there
 * is no scroll listener.
 */
export function useScrollSpy(ids: readonly string[], { scrollOffset = 200, root = null }: UseScrollSpyOptions = {}): string | null {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const key = ids.join("\u0000");

  React.useEffect(() => {
    const sectionIds = key ? key.split("\u0000") : [];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (!elements.length) {
      setActiveId(null);
      return;
    }

    const rootTop = (): number => (root ? root.getBoundingClientRect().top + root.clientTop : 0);
    const rootHeight = (): number => (root ? root.clientHeight : window.innerHeight);

    const update = (): void => {
      const line = rootTop() + scrollOffset;
      let next: string | null = null;
      for (const element of elements) {
        if (!element.isConnected || element.getClientRects().length === 0) continue;
        if (element.getBoundingClientRect().top <= line) next = element.id;
      }
      setActiveId(next);
    };

    let observer: IntersectionObserver | null = null;
    const observe = (): void => {
      observer?.disconnect();
      const height = rootHeight();
      const top = Math.min(Math.max(scrollOffset, 0), Math.max(height - 1, 0));
      const bottom = Math.max(height - top - 1, 0);
      observer = new IntersectionObserver(update, {
        root,
        rootMargin: `-${top}px 0px -${bottom}px 0px`,
        threshold: 0,
      });
      elements.forEach((element) => observer?.observe(element));
      update();
    };

    observe();
    // The line is in px from the top, so the bottom margin depends on the root's height.
    const resizeObserver = new ResizeObserver(observe);
    resizeObserver.observe(root ?? document.documentElement);
    window.addEventListener("resize", observe);
    return () => {
      observer?.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", observe);
    };
  }, [key, scrollOffset, root]);

  return activeId;
}
