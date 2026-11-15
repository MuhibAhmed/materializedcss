"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** Materialize's three pushpin classes: before, while and after pinning. */
export type PushpinState = "pin-top" | "pinned" | "pin-bottom";

export interface PushpinProps extends React.ComponentProps<"div"> {
  /** Distance in px from the top of the scroll container while pinned (Materialize `offset`). */
  top?: number;
  /** Called when the element starts or stops being pinned. */
  onPinChange?: (state: PushpinState) => void;
}

/** Nearest ancestor that clips or scrolls (the box `position: sticky` sticks to), or `null` for the page. */
function getScrollParent(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (/(auto|scroll|hidden|overlay)/.test(`${style.overflowX}${style.overflowY}`)) return node;
  }
  return null;
}

/**
 * Pin an element while its section scrolls by (Materialize pushpin), using
 * `position: sticky` instead of a scroll listener. It pins once it reaches
 * `top` px from the top of its scroll container (the top boundary is its own
 * position) and is released at the end of its parent (the bottom boundary).
 * Two IntersectionObservers report the state in `data-state` and `onPinChange`.
 */
export function Pushpin({ top = 0, onPinChange, className, style, ref, ...props }: PushpinProps): React.JSX.Element {
  const elementRef = React.useRef<HTMLDivElement | null>(null);
  const [state, setState] = React.useState<PushpinState>("pin-top");
  const onPinChangeRef = React.useRef(onPinChange);
  React.useEffect(() => {
    onPinChangeRef.current = onPinChange;
  });

  const setRef = React.useCallback(
    (node: HTMLDivElement | null): void => {
      elementRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const root = getScrollParent(element);
    let last: PushpinState | null = null;

    const measure = (): void => {
      const rootTop = root ? root.getBoundingClientRect().top + root.clientTop : 0;
      const offset = element.getBoundingClientRect().top - rootTop;
      const next: PushpinState = offset > top + 0.5 ? "pin-top" : offset < top - 0.5 ? "pin-bottom" : "pinned";
      if (next === last) return;
      last = next;
      setState(next);
      onPinChangeRef.current?.(next);
    };

    // Fires when the element sticks (it becomes 1px clipped by a line just below `top`) or unsticks.
    const pinObserver = new IntersectionObserver(measure, { root, rootMargin: `-${top + 1}px 0px 0px 0px`, threshold: [1] });
    // Fires when the end of the parent starts pushing the element up, and when it comes back.
    const releaseObserver = new IntersectionObserver(measure, { root, rootMargin: `-${top}px 0px 0px 0px`, threshold: [1] });
    pinObserver.observe(element);
    releaseObserver.observe(element);
    measure();
    return () => {
      pinObserver.disconnect();
      releaseObserver.disconnect();
    };
  }, [top]);

  return (
    <div
      ref={setRef}
      data-slot="pushpin"
      data-state={state}
      className={cn("sticky z-10", className)}
      style={{ top, ...style }}
      {...props}
    />
  );
}
