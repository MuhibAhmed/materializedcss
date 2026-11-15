"use client";

import * as React from "react";

export interface RippleOptions {
  /** Ripple color. Defaults to the element's text color (`currentColor`). */
  color?: string;
  /** Peak opacity of the ripple. */
  opacity?: number;
  /** Always start the ripple from the element's center (icon buttons). */
  center?: boolean;
  /** Turn the effect off, e.g. for disabled controls. */
  disabled?: boolean;
}

const MIN_HOLD_MS = 300;
const GROW_MS = 550;
const FADE_MS = 450;

/**
 * Material "Waves" ink ripple.
 *
 * Returns a `pointerdown` handler. Attach it to any element styled with
 * `relative overflow-hidden`. Compared with Materialize's waves.js it:
 * - uses Pointer Events (mouse, touch and pen, with no double-firing),
 * - sizes the ripple to reach the element's farthest corner,
 * - cleans up after itself (no global listeners),
 * - does nothing when the user prefers reduced motion.
 */
export function useRipple<T extends HTMLElement = HTMLElement>(
  options: RippleOptions = {},
): (event: React.PointerEvent<T>) => void {
  const { color = "currentColor", opacity = 0.2, center = false, disabled = false } = options;

  return React.useCallback(
    (event: React.PointerEvent<T>) => {
      if (disabled || event.button !== 0) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const host = event.currentTarget;
      const rect = host.getBoundingClientRect();
      const x = center ? rect.width / 2 : event.clientX - rect.left;
      const y = center ? rect.height / 2 : event.clientY - rect.top;
      const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));

      const ripple = document.createElement("span");
      ripple.setAttribute("aria-hidden", "true");
      ripple.dataset.ripple = "";
      Object.assign(ripple.style, {
        position: "absolute",
        left: `${x - radius}px`,
        top: `${y - radius}px`,
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        borderRadius: "50%",
        background: color,
        opacity: String(opacity),
        transform: "scale(0)",
        pointerEvents: "none",
        zIndex: "0",
        transition: `transform ${GROW_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${FADE_MS}ms ease-out`,
      } satisfies Partial<CSSStyleDeclaration>);
      host.appendChild(ripple);

      // Force a layout so the transition starts from scale(0).
      void ripple.offsetWidth;
      ripple.style.transform = "scale(1)";

      const startedAt = performance.now();
      const release = (): void => {
        host.removeEventListener("pointerup", release);
        host.removeEventListener("pointerleave", release);
        host.removeEventListener("pointercancel", release);
        const wait = Math.max(0, MIN_HOLD_MS - (performance.now() - startedAt));
        window.setTimeout(() => {
          ripple.style.opacity = "0";
          window.setTimeout(() => ripple.remove(), FADE_MS);
        }, wait);
      };
      host.addEventListener("pointerup", release);
      host.addEventListener("pointerleave", release);
      host.addEventListener("pointercancel", release);
    },
    [color, opacity, center, disabled],
  );
}
