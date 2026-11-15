import * as React from "react";

import { cn } from "@/lib/utils";

const tokenColors = {
  secondary: { bar: "bg-secondary", track: "bg-secondary-light", bars: "before:bg-secondary after:bg-secondary" },
  primary: { bar: "bg-primary", track: "bg-primary-light", bars: "before:bg-primary after:bg-primary" },
} as const;

export interface ProgressProps extends Omit<React.ComponentProps<"div">, "color"> {
  /**
   * Completion from `min` to `max`. Leave it `undefined` (or `null`) for an
   * indeterminate bar that loops while the duration is unknown.
   */
  value?: number | null | undefined;
  /** Lower bound of `value`. */
  min?: number;
  /** Upper bound of `value`. */
  max?: number;
  /** Accessible name, e.g. "Uploading photo". Required unless you pass `aria-label` or `aria-labelledby`. */
  label?: string;
  /** Text read by screen readers instead of the percentage, e.g. "3 of 10 files". */
  valueText?: string;
  /** Bar color. */
  color?: "secondary" | "primary";
}

/**
 * Linear progress bar (Materialize `.progress`): 4px track, determinate fill
 * that animates its width, or Materialize's two-bar indeterminate animation.
 */
export function Progress({
  className,
  value,
  min = 0,
  max = 100,
  label,
  valueText,
  color = "secondary",
  ...props
}: ProgressProps): React.JSX.Element {
  const indeterminate = value === undefined || value === null || Number.isNaN(value);
  const clamped = indeterminate ? 0 : Math.min(Math.max(value, min), max);
  const percent = max > min ? ((clamped - min) / (max - min)) * 100 : 0;
  const colors = tokenColors[color];

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : clamped}
      aria-valuetext={indeterminate ? undefined : valueText}
      data-slot="progress"
      data-state={indeterminate ? "indeterminate" : percent >= 100 ? "complete" : "loading"}
      className={cn("relative block h-1 w-full overflow-hidden rounded-[2px]", colors.track, className)}
      {...props}
    >
      {indeterminate ? (
        <div
          data-slot="progress-indicator"
          className={cn(
            "absolute inset-0",
            "before:absolute before:inset-y-0 before:will-change-[left,right] before:animate-md-indeterminate",
            "after:absolute after:inset-y-0 after:will-change-[left,right] after:animate-md-indeterminate-short",
            // Reduced motion: a slow, gentle sweep instead of the fast two-bar loop.
            "motion-reduce:before:animate-[md-indeterminate_6s_linear_infinite] motion-reduce:after:hidden",
            colors.bars,
          )}
        />
      ) : (
        <div
          data-slot="progress-indicator"
          className={cn("absolute inset-y-0 left-0 transition-[width] duration-300 ease-linear motion-reduce:transition-none", colors.bar)}
          style={{ width: `${percent}%` }}
        />
      )}
    </div>
  );
}
