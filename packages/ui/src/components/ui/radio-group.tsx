"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/** Radio style: a filled dot (`default`) or a ring with a smaller dot (`with-gap`). */
export type RadioGroupVariant = "default" | "with-gap";

const RadioGroupVariantContext = React.createContext<RadioGroupVariant>("default");

export interface RadioGroupProps extends React.ComponentProps<typeof RadioGroupPrimitive.Root> {
  /** Style of every item (items can override it). */
  variant?: RadioGroupVariant;
}

/**
 * Materialize radio buttons built on Radix RadioGroup: one tab stop, arrow-key navigation,
 * `name` / `required` form submission and controlled or uncontrolled `value`.
 */
export function RadioGroup({ variant = "default", orientation, className, ...props }: RadioGroupProps): React.JSX.Element {
  return (
    <RadioGroupVariantContext value={variant}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        orientation={orientation}
        className={cn(
          "flex gap-2",
          orientation === "horizontal" ? "flex-row flex-wrap items-start gap-x-6" : "flex-col",
          className,
        )}
        {...props}
      />
    </RadioGroupVariantContext>
  );
}

export interface RadioGroupItemProps extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {
  /** Visible label, wired to the radio with `id` / `htmlFor`. */
  label?: React.ReactNode;
  /** Secondary text under the label, linked with `aria-describedby`. */
  description?: React.ReactNode;
  /** Override the group's `variant`. */
  variant?: RadioGroupVariant;
  /** Class for the wrapper rendered when `label` or `description` is set. */
  containerClassName?: string;
  /** Class for the `<label>`. */
  labelClassName?: string;
}

/** One radio button. 16px circle; the checked dot scales in with Materialize's .28s transition. */
export function RadioGroupItem({
  label,
  description,
  variant: variantProp,
  className,
  containerClassName,
  labelClassName,
  id: idProp,
  "aria-describedby": describedByProp,
  ...props
}: RadioGroupItemProps): React.JSX.Element {
  const groupVariant = React.use(RadioGroupVariantContext);
  const variant = variantProp ?? groupVariant;
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const descriptionId = `${id}-description`;
  const hasDescription = description !== undefined && description !== null && description !== false;
  const describedBy = [describedByProp, hasDescription ? descriptionId : null].filter(Boolean).join(" ") || undefined;

  const control = (
    <RadioGroupPrimitive.Item
      id={id}
      data-slot="radio-group-item"
      data-variant={variant}
      aria-describedby={describedBy}
      className={cn(
        "group/radio peer relative inline-block size-6 shrink-0 cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0 align-middle outline-none",
        // Focus halo: Materialize's 10px grey shadow ring around the circle.
        "before:pointer-events-none before:absolute before:inset-0 before:scale-50 before:rounded-full before:bg-foreground/15 before:opacity-0",
        "before:transition-[opacity,scale] before:duration-200 motion-reduce:before:transition-none",
        "focus-visible:before:scale-150 focus-visible:before:opacity-100 data-[state=checked]:before:bg-secondary/25",
        "disabled:cursor-default",
        className,
      )}
      {...props}
    >
      {/* Ring */}
      <span
        aria-hidden="true"
        data-slot="radio-group-ring"
        className={cn(
          "pointer-events-none absolute inset-1 rounded-full border-2 border-foreground/75 transition-[border-color] duration-[280ms] ease-in-out motion-reduce:transition-none",
          variant === "with-gap"
            ? "group-data-[state=checked]/radio:border-secondary"
            : "group-data-[state=checked]/radio:border-transparent",
          "group-data-[disabled]/radio:border-foreground/40",
          variant === "default" && "group-data-[disabled]/radio:group-data-[state=checked]/radio:border-transparent",
        )}
      />
      {/* Dot */}
      <span
        aria-hidden="true"
        data-slot="radio-group-dot"
        className={cn(
          "pointer-events-none absolute inset-1 scale-0 rounded-full border-2 border-secondary bg-secondary transition-[scale,background-color,border-color] duration-[280ms] ease-in-out motion-reduce:transition-none",
          variant === "with-gap" ? "group-data-[state=checked]/radio:scale-50" : "group-data-[state=checked]/radio:scale-[1.02]",
          "group-data-[disabled]/radio:border-foreground/40 group-data-[disabled]/radio:bg-foreground/40",
        )}
      />
    </RadioGroupPrimitive.Item>
  );

  if ((label === undefined || label === null) && !hasDescription) return control;

  return (
    <div data-slot="radio-group-field" className={cn("inline-flex items-start gap-[11px]", containerClassName)}>
      {control}
      <div className="flex flex-col peer-data-[disabled]:[&>label]:cursor-default peer-data-[disabled]:[&>label]:text-foreground/45">
        {label !== undefined && label !== null ? (
          <label
            htmlFor={id}
            data-slot="radio-group-label"
            className={cn("cursor-pointer text-base leading-6 text-foreground select-none", labelClassName)}
          >
            {label}
          </label>
        ) : null}
        {hasDescription ? (
          <span id={descriptionId} data-slot="radio-group-description" className="text-sm text-muted-foreground">
            {description}
          </span>
        ) : null}
      </div>
    </div>
  );
}
