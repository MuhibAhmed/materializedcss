import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const cardVariants = cva(
  "relative rounded-ui bg-surface text-foreground shadow-z1 transition-shadow duration-250",
  {
    variants: {
      size: {
        auto: "",
        // Fixed heights; the image takes up to 60% and the action bar sticks to the bottom.
        sm: "h-[300px] overflow-hidden",
        md: "h-[400px] overflow-hidden",
        lg: "h-[500px] overflow-hidden",
      },
      orientation: {
        vertical: "flex flex-col",
        horizontal: "flex flex-row",
      },
      hoverable: {
        true: "hoverable",
        false: "",
      },
    },
    defaultVariants: { size: "auto", orientation: "vertical", hoverable: false },
  },
);

export interface CardProps extends React.ComponentProps<"div"> {
  /** Fixed height: `sm` 300px, `md` 400px, `lg` 500px (Materialize `.small/.medium/.large`). `auto` fits the content. */
  size?: "auto" | "sm" | "md" | "lg" | null | undefined;
  /** `horizontal` puts the image beside the content (Materialize `.horizontal`). */
  orientation?: "vertical" | "horizontal" | null | undefined;
  /** Raise the card on hover (Materialize `.hoverable`). */
  hoverable?: boolean | null | undefined;
}

/** Material card (Materialize `.card`): a raised surface for related content and actions. */
export function Card({ className, size, orientation, hoverable, ...props }: CardProps): React.JSX.Element {
  const sized = size != null && size !== "auto";
  return (
    <div
      data-slot="card"
      data-size={size ?? "auto"}
      data-orientation={orientation ?? "vertical"}
      className={cn(
        cardVariants({ size, orientation, hoverable }),
        // Fixed-size cards: clip the image and content, pin the actions to the bottom.
        sized &&
          orientation !== "horizontal" &&
          "[&>[data-slot=card-image]]:max-h-[60%] [&>[data-slot=card-image]]:shrink-0 [&>[data-slot=card-image]]:overflow-hidden [&>[data-slot=card-content]]:min-h-0 [&>[data-slot=card-content]]:flex-1 [&>[data-slot=card-content]]:overflow-hidden [&>[data-slot=card-action]]:mt-auto",
        orientation === "horizontal" &&
          "[&>[data-slot=card-image]]:w-1/2 [&>[data-slot=card-image]]:max-w-[50%] [&>[data-slot=card-image]]:shrink-0 [&>[data-slot=card-image]_img]:h-full [&>[data-slot=card-image]_img]:w-full [&>[data-slot=card-image]_img]:rounded-[2px_0_0_2px] [&>[data-slot=card-image]_img]:object-cover",
        className,
      )}
      {...props}
    />
  );
}

/** Image area at the top of a card. Put an `<img>` and optionally a `CardTitle` inside. */
export function CardImage({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="card-image"
      className={cn(
        "relative [&_img]:block [&_img]:w-full [&_img]:rounded-[2px_2px_0_0]",
        // A title over the image sits in the bottom-left corner in white.
        "[&>[data-slot=card-title]]:absolute [&>[data-slot=card-title]]:bottom-0 [&>[data-slot=card-title]]:left-0 [&>[data-slot=card-title]]:m-0 [&>[data-slot=card-title]]:max-w-full [&>[data-slot=card-title]]:p-6 [&>[data-slot=card-title]]:text-white [&>[data-slot=card-title]]:[text-shadow:0_1px_3px_rgb(0_0_0/0.45)]",
        className,
      )}
      {...props}
    />
  );
}

/** Padded body of a card (24px). */
export function CardContent({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "rounded-b-ui p-6 [&_p]:m-0 [&>[data-slot=card-title]]:mb-2 [&>[data-slot=card-title]]:block [&>[data-slot=card-title]]:leading-8",
        className,
      )}
      {...props}
    />
  );
}

export interface CardTitleProps extends React.ComponentProps<"h3"> {
  /** Heading element to render. Pick the level that fits your document outline. */
  as?: "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "div";
}

/** Card heading: 24px, light weight. */
export function CardTitle({ className, as: Comp = "h3", ...props }: CardTitleProps): React.JSX.Element {
  return (
    <Comp
      data-slot="card-title"
      className={cn("flex items-center gap-2 text-2xl font-light leading-8", className)}
      {...props}
    />
  );
}

/** Action bar at the bottom of a card. Plain links are uppercase and use the card link color. */
export function CardAction({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "relative flex flex-wrap items-center gap-y-2 border-t border-[rgb(160_160_160/0.2)] bg-inherit px-6 py-4 last:rounded-b-ui",
        "[&_a:not([data-slot])]:mr-6 [&_a:not([data-slot])]:rounded-ui [&_a:not([data-slot])]:uppercase [&_a:not([data-slot])]:text-card-link [&_a:not([data-slot])]:no-underline [&_a:not([data-slot])]:outline-none [&_a:not([data-slot])]:transition-opacity [&_a:not([data-slot])]:duration-300 [&_a:not([data-slot])]:hover:opacity-80 [&_a:not([data-slot])]:focus-visible:focus-ring",
        className,
      )}
      {...props}
    />
  );
}

/** Column that stacks content and actions next to the image of a horizontal card (Materialize `.card-stacked`). */
export function CardStacked({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="card-stacked"
      className={cn("relative flex min-w-0 flex-1 flex-col [&>[data-slot=card-content]]:grow", className)}
      {...props}
    />
  );
}

/** Simple padded panel with card elevation (Materialize `.card-panel`). */
export function CardPanel({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="card-panel"
      className={cn("rounded-ui bg-surface p-6 text-foreground shadow-z1 transition-shadow duration-250", className)}
      {...props}
    />
  );
}
