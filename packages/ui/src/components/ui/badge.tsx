import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  [
    "inline-flex h-[22px] min-w-12 shrink-0 items-center justify-center gap-1 whitespace-nowrap px-1.5 text-center align-middle leading-[22px]",
  ],
  {
    variants: {
      variant: {
        /** Materialize `span.badge`: plain grey count. */
        default: "text-base text-muted-foreground",
        /** Materialize `span.badge.new`: filled, light weight, with a caption. */
        new: "rounded-ui text-[0.8rem] font-light",
      },
      color: {
        default: "",
        primary: "",
        secondary: "",
        error: "",
        success: "",
      },
    },
    compoundVariants: [
      { variant: "new", color: ["default", "secondary"], className: "bg-secondary text-secondary-foreground" },
      { variant: "new", color: "primary", className: "bg-primary text-primary-foreground" },
      { variant: "new", color: "error", className: "bg-error text-error-foreground" },
      { variant: "new", color: "success", className: "bg-success text-success-foreground" },
    ],
    defaultVariants: { variant: "default", color: "default" },
  },
);

export interface BadgeProps extends Omit<React.ComponentProps<"span">, "color"> {
  /** `default` is Materialize's plain count; `new` is the filled notification badge. */
  variant?: "default" | "new" | null | undefined;
  /** Fill color of a `new` badge. `default` is the secondary (teal) color. */
  color?: "default" | "primary" | "secondary" | "error" | "success" | null | undefined;
  /**
   * Text appended after the content (Materialize `data-badge-caption`). Defaults to
   * `"new"` for the `new` variant; pass `""` or `null` to hide it. Unlike
   * Materialize's CSS `content`, the caption is real text that screen readers announce.
   */
  caption?: React.ReactNode;
}

/**
 * Small count or status label (Materialize `span.badge`). Place it at the end
 * of collection items, navbar links or dropdown items.
 */
export function Badge({ className, variant, color, caption, children, ...props }: BadgeProps): React.JSX.Element {
  const resolvedCaption = caption === undefined ? (variant === "new" ? "new" : null) : caption;
  const hasCaption = resolvedCaption !== null && resolvedCaption !== "" && resolvedCaption !== false;
  return (
    <span
      data-slot="badge"
      data-variant={variant ?? "default"}
      className={cn(badgeVariants({ variant, color }), className)}
      {...props}
    >
      {children}
      {hasCaption ? <span data-slot="badge-caption">{resolvedCaption}</span> : null}
    </span>
  );
}
