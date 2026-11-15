import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names, resolving conflicting Tailwind utilities (last one wins). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Compose several event handlers; stops when a handler calls `preventDefault()`. */
export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  ...handlers: Array<((event: E) => void) | undefined>
): (event: E) => void {
  return (event: E) => {
    for (const handler of handlers) {
      handler?.(event);
      if (event.defaultPrevented) return;
    }
  };
}

/** True when the user asked the OS to minimise animation. Safe to call during SSR. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
