import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const headingVariants = cva("font-normal leading-[1.1] text-foreground", {
  variants: {
    size: {
      h1: "text-h1",
      h2: "text-h2",
      h3: "text-h3",
      h4: "text-h4",
      h5: "text-h5",
      h6: "text-h6",
    },
    // Materialize's heading margins (top / bottom).
    spacing: {
      default: "",
      none: "m-0",
    },
  },
  compoundVariants: [
    { spacing: "default", size: "h1", className: "mt-[2.8rem] mb-[1.68rem]" },
    { spacing: "default", size: "h2", className: "mt-[2.3733rem] mb-[1.424rem]" },
    { spacing: "default", size: "h3", className: "mt-[1.9466rem] mb-[1.168rem]" },
    { spacing: "default", size: "h4", className: "mt-[1.52rem] mb-[0.912rem]" },
    { spacing: "default", size: "h5", className: "mt-[1.0933rem] mb-[0.656rem]" },
    { spacing: "default", size: "h6", className: "mt-[0.7666rem] mb-[0.46rem]" },
  ],
  defaultVariants: { size: "h1", spacing: "default" },
});

export interface HeadingProps extends React.ComponentProps<"h1"> {
  /** Heading level: sets the element (`<h1>`–`<h6>`) and, unless `size` is given, the size. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Visual size, independent of the level (keep a correct outline while matching a design). */
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** `default` applies Materialize's heading margins; `none` removes them. */
  spacing?: "default" | "none";
}

/** Materialize heading (4.2rem → 1.15rem, weight 400, line-height 110%). */
export function Heading({ className, level = 1, size, spacing, ...props }: HeadingProps): React.JSX.Element {
  const Comp = `h${level}` as "h1";
  return (
    <Comp
      data-slot="heading"
      className={cn(headingVariants({ size: size ?? (`h${level}` as HeadingProps["size"]), spacing }), className)}
      {...props}
    />
  );
}

/** Quotation with a 5px primary-light left border (Materialize `blockquote`). */
export function Blockquote({ className, ...props }: React.ComponentProps<"blockquote">): React.JSX.Element {
  return (
    <blockquote
      data-slot="blockquote"
      className={cn("my-5 border-l-[5px] border-primary-light pl-6 text-foreground", className)}
      {...props}
    />
  );
}

export interface FlowTextProps extends React.ComponentProps<"p"> {
  /** Render a `<div>` instead of a `<p>` when the content holds block elements. */
  as?: "p" | "div";
}

/**
 * Large, light text that scales smoothly with the viewport (Materialize `.flow-text`).
 * Spelled out as standard utilities (not the `flow-text` utility) so `text-*`, `leading-*`
 * and `font-*` classes passed in `className` override it.
 */
export function FlowText({ className, as: Comp = "p", ...props }: FlowTextProps): React.JSX.Element {
  return (
    <Comp
      data-slot="flow-text"
      className={cn(
        "text-[length:clamp(1.2rem,0.9rem+0.9vw,1.6rem)] leading-[1.6] font-light text-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** Introductory paragraph: larger and lighter than body text. */
export function Lead({ className, ...props }: React.ComponentProps<"p">): React.JSX.Element {
  return <p data-slot="lead" className={cn("text-xl font-light leading-relaxed text-foreground", className)} {...props} />;
}

/** Secondary, de-emphasized text (captions, hints, metadata). */
export function Muted({ className, ...props }: React.ComponentProps<"p">): React.JSX.Element {
  return <p data-slot="muted" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
