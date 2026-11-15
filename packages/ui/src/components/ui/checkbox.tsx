"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/** Checked state of a checkbox: `true`, `false` or `"indeterminate"`. */
export type CheckboxCheckedState = boolean | "indeterminate";

export interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  /** Materialize style: the morphing tick (`default`) or a filled box with a white tick (`filled-in`). */
  variant?: "default" | "filled-in";
  /** Visible label, wired to the checkbox with `id` / `htmlFor`. */
  label?: React.ReactNode;
  /** Secondary text under the label, linked with `aria-describedby`. */
  description?: React.ReactNode;
  /** Class for the wrapper rendered when `label` or `description` is set. */
  containerClassName?: string;
  /** Class for the `<label>`. */
  labelClassName?: string;
}

/**
 * Materialize checkbox built on Radix Checkbox. The default style morphs the box into a rotated
 * tick; `filled-in` fills the box. Supports the indeterminate state, labels, descriptions and
 * native form submission (`name` / `value`).
 */
export function Checkbox({
  variant = "default",
  label,
  description,
  className,
  containerClassName,
  labelClassName,
  id: idProp,
  "aria-describedby": describedByProp,
  ...props
}: CheckboxProps): React.JSX.Element {
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const descriptionId = `${id}-description`;
  const hasDescription = description !== undefined && description !== null && description !== false;
  const describedBy = [describedByProp, hasDescription ? descriptionId : null].filter(Boolean).join(" ") || undefined;

  const control = (
    <CheckboxPrimitive.Root
      id={id}
      data-slot="checkbox"
      data-variant={variant}
      aria-describedby={describedBy}
      className={cn(
        "group/checkbox peer relative inline-block shrink-0 cursor-pointer appearance-none rounded-none border-0 bg-transparent p-0 align-middle outline-none",
        // Focus halo (Materialize's grey circle behind the box), secondary-tinted when checked.
        "before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:size-10 before:-translate-x-1/2 before:-translate-y-1/2",
        "before:scale-50 before:rounded-full before:bg-foreground/15 before:opacity-0 before:transition-[opacity,scale] before:duration-200 motion-reduce:before:transition-none",
        "focus-visible:before:scale-100 focus-visible:before:opacity-100",
        "data-[state=checked]:before:bg-secondary/25 data-[state=indeterminate]:before:bg-secondary/25",
        "disabled:cursor-default",
        variant === "filled-in" ? "mt-[2px] size-5" : "mt-[3px] size-[18px]",
        className,
      )}
      {...props}
    >
      {variant === "filled-in" ? (
        <>
          <span
            data-slot="checkbox-box"
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-0 left-0 z-0 size-5 rounded-[2px] border-2 border-foreground/75 bg-transparent",
              "transition-[border-color,background-color] duration-200 motion-reduce:transition-none",
              "group-data-[state=checked]/checkbox:border-secondary group-data-[state=checked]/checkbox:bg-secondary group-data-[state=indeterminate]/checkbox:border-secondary group-data-[state=indeterminate]/checkbox:bg-secondary",
              "group-data-[disabled]/checkbox:border-transparent group-data-[disabled]/checkbox:bg-foreground/35",
              // Grey out checked / indeterminate boxes too (these need the extra specificity to beat the state colors).
              "group-data-[disabled]/checkbox:group-data-[state=checked]/checkbox:border-transparent group-data-[disabled]/checkbox:group-data-[state=checked]/checkbox:bg-foreground/35",
              "group-data-[disabled]/checkbox:group-data-[state=indeterminate]/checkbox:border-transparent group-data-[disabled]/checkbox:group-data-[state=indeterminate]/checkbox:bg-foreground/35",
            )}
          />
          <span
            data-slot="checkbox-tick"
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-2.5 left-1.5 z-[1] size-0 rotate-[37deg] border-[3px] border-transparent",
              "origin-[20%_40%] transition-all duration-200 motion-reduce:transition-none",
              "group-data-[state=checked]/checkbox:top-0 group-data-[state=checked]/checkbox:left-px group-data-[state=checked]/checkbox:h-[13px] group-data-[state=checked]/checkbox:w-2 group-data-[state=checked]/checkbox:origin-[100%_100%]",
              "group-data-[state=checked]/checkbox:border-2 group-data-[state=checked]/checkbox:border-t-transparent group-data-[state=checked]/checkbox:border-l-transparent",
              "group-data-[state=checked]/checkbox:border-r-secondary-foreground group-data-[state=checked]/checkbox:border-b-secondary-foreground",
              "group-data-[state=indeterminate]/checkbox:top-[9px] group-data-[state=indeterminate]/checkbox:left-1 group-data-[state=indeterminate]/checkbox:h-0.5 group-data-[state=indeterminate]/checkbox:w-3 group-data-[state=indeterminate]/checkbox:rotate-0 group-data-[state=indeterminate]/checkbox:border-0 group-data-[state=indeterminate]/checkbox:bg-secondary-foreground",
              // Only the checked tick is recolored; an unchecked tick must stay transparent (no stray mark).
              "group-data-[disabled]/checkbox:group-data-[state=checked]/checkbox:border-r-surface group-data-[disabled]/checkbox:group-data-[state=checked]/checkbox:border-b-surface",
              "group-data-[disabled]/checkbox:group-data-[state=indeterminate]/checkbox:bg-surface",
            )}
          />
        </>
      ) : (
        <span
          data-slot="checkbox-box"
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-0 left-0 size-[18px] origin-[100%_100%] rounded-[1px] border-2 border-foreground/75 [backface-visibility:hidden]",
            "transition-all duration-200 motion-reduce:transition-none",
            // Checked: the box collapses into a tick rotated 40deg (right + bottom borders).
            "group-data-[state=checked]/checkbox:-top-1 group-data-[state=checked]/checkbox:-left-[5px] group-data-[state=checked]/checkbox:h-[22px] group-data-[state=checked]/checkbox:w-3 group-data-[state=checked]/checkbox:rotate-40 group-data-[state=checked]/checkbox:rounded-none",
            "group-data-[state=checked]/checkbox:border-t-transparent group-data-[state=checked]/checkbox:border-l-transparent group-data-[state=checked]/checkbox:border-r-secondary group-data-[state=checked]/checkbox:border-b-secondary",
            // Indeterminate: a horizontal dash.
            "group-data-[state=indeterminate]/checkbox:-top-[11px] group-data-[state=indeterminate]/checkbox:-left-3 group-data-[state=indeterminate]/checkbox:h-[22px] group-data-[state=indeterminate]/checkbox:w-2.5 group-data-[state=indeterminate]/checkbox:rotate-90 group-data-[state=indeterminate]/checkbox:rounded-none",
            "group-data-[state=indeterminate]/checkbox:border-t-0 group-data-[state=indeterminate]/checkbox:border-b-0 group-data-[state=indeterminate]/checkbox:border-l-0 group-data-[state=indeterminate]/checkbox:border-r-secondary",
            // Disabled.
            "group-data-[disabled]/checkbox:group-data-[state=unchecked]/checkbox:border-transparent group-data-[disabled]/checkbox:group-data-[state=unchecked]/checkbox:bg-foreground/35",
            "group-data-[disabled]/checkbox:border-r-foreground/40 group-data-[disabled]/checkbox:group-data-[state=checked]/checkbox:border-b-foreground/40",
          )}
        />
      )}
    </CheckboxPrimitive.Root>
  );

  if ((label === undefined || label === null) && !hasDescription) return control;

  return (
    <div data-slot="checkbox-field" className={cn("inline-flex items-start", variant === "filled-in" ? "gap-[15px]" : "gap-[17px]", containerClassName)}>
      {control}
      <div className="flex flex-col peer-data-[disabled]:[&>label]:cursor-default peer-data-[disabled]:[&>label]:text-foreground/45">
        {label !== undefined && label !== null ? (
          <label
            htmlFor={id}
            data-slot="checkbox-label"
            className={cn("cursor-pointer text-base leading-[25px] text-foreground select-none", labelClassName)}
          >
            {label}
          </label>
        ) : null}
        {hasDescription ? (
          <span id={descriptionId} data-slot="checkbox-description" className="text-sm text-muted-foreground">
            {description}
          </span>
        ) : null}
      </div>
    </div>
  );
}
