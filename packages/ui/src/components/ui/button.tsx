"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cva } from "class-variance-authority";

import { useRipple } from "@/hooks/use-ripple";
import { cn, composeEventHandlers } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "relative isolate inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 overflow-hidden",
    "whitespace-nowrap align-middle font-medium uppercase tracking-[0.5px] no-underline",
    "transition-[background-color,box-shadow,color] duration-200 ease-out",
    "outline-none focus-visible:focus-ring",
    // State layer: tints the button with its own text color on hover / focus / press.
    "after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:bg-current after:opacity-0 after:transition-opacity after:duration-200",
    "hover:after:opacity-[0.08] focus-visible:after:opacity-[0.12] active:after:opacity-[0.16]",
    "disabled:pointer-events-none disabled:cursor-default aria-disabled:pointer-events-none aria-disabled:cursor-default",
    "[&_svg]:pointer-events-none [&_svg]:size-[1.3rem] [&_.material-icons]:text-[1.3rem]",
  ],
  {
    variants: {
      variant: {
        raised:
          "rounded-ui shadow-z1 hover:shadow-z1-half focus-visible:shadow-z1-half active:shadow-z2 disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none aria-disabled:bg-disabled aria-disabled:text-disabled-foreground aria-disabled:shadow-none",
        flat: "rounded-ui bg-transparent disabled:text-disabled-foreground aria-disabled:text-disabled-foreground",
        outlined:
          "rounded-ui border border-current/40 bg-transparent disabled:border-disabled disabled:text-disabled-foreground aria-disabled:border-disabled aria-disabled:text-disabled-foreground",
        floating:
          "rounded-full p-0 shadow-z1 hover:shadow-z1-half focus-visible:shadow-z1-half active:shadow-z2 disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none aria-disabled:bg-disabled aria-disabled:text-disabled-foreground aria-disabled:shadow-none [&_svg]:size-6 [&_.material-icons]:text-[1.6rem]",
      },
      color: {
        default: "",
        primary: "",
        secondary: "",
        error: "",
        success: "",
      },
      size: {
        sm: "h-8 px-4 text-[13px] [&_svg]:size-[1.2rem]",
        md: "h-9 px-4 text-sm",
        lg: "h-[54px] px-7 text-[15px] [&_svg]:size-[1.6rem]",
      },
    },
    compoundVariants: [
      // Filled buttons: Materialize uses the secondary (teal) color by default.
      { variant: ["raised", "floating"], color: ["default", "secondary"], className: "bg-secondary text-secondary-foreground" },
      { variant: ["raised", "floating"], color: "primary", className: "bg-primary text-primary-foreground" },
      { variant: ["raised", "floating"], color: "error", className: "bg-error text-error-foreground" },
      { variant: ["raised", "floating"], color: "success", className: "bg-success text-success-foreground" },
      // Text buttons.
      { variant: ["flat", "outlined"], color: "default", className: "text-foreground" },
      { variant: ["flat", "outlined"], color: "primary", className: "text-primary" },
      { variant: ["flat", "outlined"], color: "secondary", className: "text-secondary" },
      { variant: ["flat", "outlined"], color: "error", className: "text-error" },
      { variant: ["flat", "outlined"], color: "success", className: "text-success" },
      // Floating action buttons are circles: 32.4 / 40 / 56px.
      { variant: "floating", size: "sm", className: "size-8 px-0" },
      { variant: "floating", size: "md", className: "size-10 px-0" },
      { variant: "floating", size: "lg", className: "size-14 px-0 [&_svg]:size-7" },
    ],
    defaultVariants: { variant: "raised", color: "default", size: "md" },
  },
);

export interface ButtonVariantProps {
  /** Visual style: `raised` (Materialize `.btn`), `flat`, `outlined` or round `floating`. */
  variant?: "raised" | "flat" | "outlined" | "floating" | null | undefined;
  /** Theme color. `default` is teal (secondary) for filled buttons and the text color for flat ones. */
  color?: "default" | "primary" | "secondary" | "error" | "success" | null | undefined;
  /** `sm` (32px), `md` (36px) or `lg` (54px). */
  size?: "sm" | "md" | "lg" | null | undefined;
}


export interface ButtonProps extends Omit<React.ComponentProps<"button">, "color">, ButtonVariantProps {
  /** Render the child element (e.g. a link) with button styling instead of a `<button>`. */
  asChild?: boolean;
  /** Show the Material ink ripple on press. */
  ripple?: boolean;
  /** Draw attention with an animated pulse ring (Materialize `.pulse`). */
  pulse?: boolean;
}

/**
 * Material button. Supports raised, flat, outlined and floating styles, three
 * sizes, theme colors, ink ripples and `asChild` for links.
 */
export function Button({
  className,
  variant,
  color,
  size,
  asChild = false,
  ripple = true,
  pulse = false,
  disabled,
  onPointerDown,
  type,
  ...props
}: ButtonProps): React.JSX.Element {
  const ariaDisabled = props["aria-disabled"];
  const isDisabled = Boolean(disabled) || ariaDisabled === true || ariaDisabled === "true";
  const startRipple = useRipple({ disabled: !ripple || isDisabled });
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "raised"}
      className={cn(
        buttonVariants({ variant, color, size }),
        pulse &&
          !isDisabled &&
          "overflow-visible before:absolute before:inset-0 before:-z-20 before:rounded-[inherit] before:bg-inherit before:animate-md-pulse motion-reduce:before:animate-none",
        className,
      )}
      disabled={asChild ? undefined : disabled}
      type={asChild ? undefined : (type ?? "button")}
      onPointerDown={composeEventHandlers(onPointerDown, startRipple)}
      {...props}
    />
  );
}
