"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

export interface SwitchProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  /** Visible label (the accessible name), wired with `id` / `htmlFor`. */
  label?: React.ReactNode;
  /** Text before the lever, e.g. `"Off"` (Materialize `.switch` markup). Decorative: state is exposed by `aria-checked`. */
  offLabel?: React.ReactNode;
  /** Text after the lever, e.g. `"On"`. Decorative: state is exposed by `aria-checked`. */
  onLabel?: React.ReactNode;
  /** Secondary text, linked with `aria-describedby`. */
  description?: React.ReactNode;
  /** Class for the wrapper rendered when any label is set. */
  containerClassName?: string;
  /** Class for the `<label>`. */
  labelClassName?: string;
  /** Class for the thumb. */
  thumbClassName?: string;
}

/**
 * Materialize switch (lever) built on Radix Switch: 36×14 track, 20px thumb that slides 18px and
 * turns secondary, focus/press halo, optional Off/On text and native form submission.
 */
export function Switch({
  label,
  offLabel,
  onLabel,
  description,
  className,
  containerClassName,
  labelClassName,
  thumbClassName,
  id: idProp,
  "aria-describedby": describedByProp,
  ...props
}: SwitchProps): React.JSX.Element {
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const descriptionId = `${id}-description`;
  const labelId = `${id}-label`;
  const has = (node: React.ReactNode): boolean => node !== undefined && node !== null && node !== false;
  const hasDescription = has(description);
  const describedBy = [describedByProp, hasDescription ? descriptionId : null].filter(Boolean).join(" ") || undefined;

  const lever = (
    <SwitchPrimitive.Root
      id={id}
      data-slot="switch"
      aria-describedby={describedBy}
      aria-labelledby={has(label) && props["aria-label"] === undefined ? (props["aria-labelledby"] ?? labelId) : props["aria-labelledby"]}
      className={cn(
        "group/switch relative isolate inline-block h-3.5 w-9 shrink-0 cursor-pointer appearance-none rounded-[15px] border-0 p-0 align-middle outline-none",
        "bg-foreground/40 transition-[background-color] duration-300 ease-in-out motion-reduce:transition-none",
        "data-[state=checked]:bg-secondary/50",
        "disabled:cursor-default disabled:bg-foreground/12 disabled:data-[state=checked]:bg-foreground/12",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none absolute -top-[3px] left-0 block size-5 rounded-full bg-md-grey-50 shadow-z1 dark:bg-md-grey-400",
          "transition-[translate,background-color] duration-300 ease-in-out motion-reduce:transition-none",
          "data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-secondary",
          "group-disabled/switch:bg-md-grey-500 group-disabled/switch:shadow-none dark:group-disabled/switch:bg-md-grey-700",
          // Halo (Materialize .lever:before): grows to 2.4x on keyboard focus and while pressed.
          "before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-foreground/10 before:content-['']",
          "before:scale-100 before:opacity-0 before:transition-[scale,opacity] before:duration-100 motion-reduce:before:transition-none",
          "data-[state=checked]:before:bg-secondary/15",
          "group-focus-visible/switch:before:scale-[2.4] group-focus-visible/switch:before:opacity-100",
          "group-active/switch:before:scale-[2.4] group-active/switch:before:opacity-100 group-disabled/switch:before:hidden",
          thumbClassName,
        )}
      />
    </SwitchPrimitive.Root>
  );

  if (!has(label) && !has(offLabel) && !has(onLabel) && !hasDescription) return lever;

  return (
    <div data-slot="switch-field" className={cn("inline-flex flex-col gap-1", containerClassName)}>
      <div className="inline-flex items-center gap-4">
        {has(label) ? (
          <label
            id={labelId}
            htmlFor={id}
            data-slot="switch-label"
            className={cn("mr-2 cursor-pointer text-base text-foreground select-none", labelClassName)}
          >
            {label}
          </label>
        ) : null}
        {has(offLabel) ? (
          <label htmlFor={id} aria-hidden="true" data-slot="switch-off-label" className="cursor-pointer text-sm text-muted-foreground select-none">
            {offLabel}
          </label>
        ) : null}
        {lever}
        {has(onLabel) ? (
          <label htmlFor={id} aria-hidden="true" data-slot="switch-on-label" className="cursor-pointer text-sm text-muted-foreground select-none">
            {onLabel}
          </label>
        ) : null}
      </div>
      {hasDescription ? (
        <span id={descriptionId} data-slot="switch-description" className="text-sm text-muted-foreground">
          {description}
        </span>
      ) : null}
    </div>
  );
}
