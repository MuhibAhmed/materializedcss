"use client";

import * as React from "react";
import { Slider } from "radix-ui";

import { useControllableState } from "@/hooks/use-controllable-state";
import { cn, composeEventHandlers } from "@/lib/utils";

/** When the thumb value bubble is shown. */
export type RangeValueLabel = "auto" | "always" | "off";

export interface RangeProps
  extends Omit<React.ComponentProps<typeof Slider.Root>, "children" | "value" | "defaultValue" | "onValueChange"> {
  /** Controlled values, one per thumb (`[50]` for a single thumb, `[20, 80]` for a range). */
  value?: number[] | undefined;
  /** Initial values for uncontrolled usage. Defaults to `[min]`. */
  defaultValue?: number[] | undefined;
  /** Called with the new values while the user drags or presses keys. */
  onValueChange?: ((value: number[]) => void) | undefined;
  /** Text shown in the value bubble. Defaults to the number. */
  formatValue?: ((value: number, index: number) => React.ReactNode) | undefined;
  /**
   * Text announced by screen readers (`aria-valuetext`). Defaults to `formatValue` when it returns
   * a string, otherwise the number.
   */
  getAriaValueText?: ((value: number, index: number) => string) | undefined;
  /**
   * `auto` (Materialize): the bubble grows above the thumb while dragging or keyboard focused.
   * `always` keeps it visible, `off` hides it.
   */
  valueLabel?: RangeValueLabel | undefined;
  /** Accessible names for each thumb of a multi-thumb range (default "Minimum" / "Maximum"). */
  thumbLabels?: string[] | undefined;
  /** Class for each thumb. */
  thumbClassName?: string | undefined;
  /** Class for the track. */
  trackClassName?: string | undefined;
}

/**
 * Materialize range slider built on Radix Slider: a 3px track, a 14px secondary thumb and the
 * signature value bubble that grows above the thumb while dragging. Supports multiple thumbs,
 * steps, vertical orientation and form submission (`name`).
 */
export function Range({
  className,
  value: valueProp,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  formatValue,
  getAriaValueText,
  valueLabel = "auto",
  thumbLabels,
  thumbClassName,
  trackClassName,
  orientation = "horizontal",
  disabled,
  onPointerDown,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: RangeProps): React.JSX.Element {
  const [values, setValues] = useControllableState<number[]>({
    value: valueProp,
    defaultValue: defaultValue ?? [min],
    onChange: onValueChange,
  });
  const [dragging, setDragging] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);
  // Thumb being dragged. Radix does not always move DOM focus on pointer drags, so track it here.
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const baseId = React.useId();

  React.useEffect(() => {
    if (!dragging) return undefined;
    const stop = (): void => setDragging(false);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging]);

  const multiple = values.length > 1;

  return (
    <Slider.Root
      data-slot="range"
      value={values}
      onValueChange={setValues}
      min={min}
      max={max}
      orientation={orientation}
      disabled={disabled}
      onPointerDown={composeEventHandlers(onPointerDown, (event: React.PointerEvent<HTMLSpanElement>) => {
        if (disabled || event.button !== 0) return;
        setDragging(true);
        // The thumb closest to the pointer is the one Radix moves.
        const thumbs = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[data-slot="range-thumb"]'));
        let closest = 0;
        let best = Number.POSITIVE_INFINITY;
        thumbs.forEach((thumb, index) => {
          const rect = thumb.getBoundingClientRect();
          const distance = Math.hypot(rect.left + rect.width / 2 - event.clientX, rect.top + rect.height / 2 - event.clientY);
          if (distance < best) {
            best = distance;
            closest = index;
          }
        });
        setDragIndex(closest);
      })}
      className={cn(
        "group/range relative flex touch-none select-none items-center",
        "data-[orientation=horizontal]:h-6 data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:h-48 data-[orientation=vertical]:w-6 data-[orientation=vertical]:flex-col",
        "data-[disabled]:cursor-default",
        className,
      )}
      {...props}
    >
      <Slider.Track
        data-slot="range-track"
        className={cn(
          "relative grow overflow-hidden rounded-full bg-foreground/25",
          "data-[orientation=horizontal]:h-[3px] data-[orientation=horizontal]:w-full",
          "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-[3px]",
          trackClassName,
        )}
      >
        <Slider.Range
          data-slot="range-fill"
          className="absolute rounded-full bg-secondary data-[disabled]:bg-foreground/30 data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </Slider.Track>
      {values.map((value, index) => {
        const display = formatValue ? formatValue(value, index) : value;
        const valueText = getAriaValueText
          ? getAriaValueText(value, index)
          : typeof display === "string" || typeof display === "number"
            ? String(display)
            : undefined;
        const thumbId = `${baseId}-thumb-${index}`;
        const ownLabel = multiple ? (thumbLabels?.[index] ?? defaultThumbLabel(index, values.length)) : undefined;
        const active = valueLabel === "always" || (valueLabel === "auto" && dragging && (dragIndex === index || focusedIndex === index));
        return (
          <Slider.Thumb
            // Thumbs are positional: the index is their identity.
            key={index}
            id={thumbId}
            data-slot="range-thumb"
            data-active={active ? "true" : undefined}
            aria-label={ownLabel !== undefined ? (ariaLabel ? `${ariaLabel} ${ownLabel.toLowerCase()}` : ownLabel) : ariaLabel}
            aria-labelledby={ariaLabelledBy ? (ownLabel !== undefined ? `${ariaLabelledBy} ${thumbId}` : ariaLabelledBy) : undefined}
            aria-valuetext={valueText}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex((current) => (current === index ? null : current))}
            className={cn(
              "group/thumb relative block size-3.5 cursor-grab rounded-full bg-secondary outline-none active:cursor-grabbing",
              "transition-[box-shadow] duration-200 motion-reduce:transition-none",
              "hover:shadow-[0_0_0_8px_color-mix(in_srgb,var(--secondary)_14%,transparent)]",
              "focus-visible:focus-ring focus-visible:shadow-[0_0_0_8px_color-mix(in_srgb,var(--secondary)_20%,transparent)]",
              "data-[disabled]:cursor-default data-[disabled]:bg-foreground/30 data-[disabled]:shadow-none",
              thumbClassName,
            )}
          >
            {valueLabel === "off" ? null : (
              <span
                aria-hidden="true"
                data-slot="range-bubble"
                className={cn(
                  "pointer-events-none absolute size-[30px]",
                  "transition-[scale,opacity] duration-300 ease-out-quint motion-reduce:transition-none",
                  // Horizontal: above the thumb, pointing down. Vertical: left of the thumb, pointing right.
                  "group-data-[orientation=horizontal]/range:bottom-[calc(100%+6px)] group-data-[orientation=horizontal]/range:left-1/2 group-data-[orientation=horizontal]/range:-ml-[15px] group-data-[orientation=horizontal]/range:origin-[50%_calc(100%+13px)]",
                  "group-data-[orientation=vertical]/range:top-1/2 group-data-[orientation=vertical]/range:right-[calc(100%+6px)] group-data-[orientation=vertical]/range:-mt-[15px] group-data-[orientation=vertical]/range:origin-[calc(100%+13px)_50%]",
                  "scale-0 opacity-0 group-focus-visible/thumb:scale-100 group-focus-visible/thumb:opacity-100 group-data-[active=true]/thumb:scale-100 group-data-[active=true]/thumb:opacity-100",
                )}
              >
                <span
                  className={cn(
                    "flex size-full items-center justify-center rounded-[50%_50%_50%_0] bg-secondary text-secondary-foreground",
                    "group-data-[orientation=horizontal]/range:-rotate-45 group-data-[orientation=vertical]/range:rotate-[225deg]",
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none whitespace-nowrap",
                      "group-data-[orientation=horizontal]/range:rotate-45 group-data-[orientation=vertical]/range:-rotate-[225deg]",
                    )}
                  >
                    {display}
                  </span>
                </span>
              </span>
            )}
          </Slider.Thumb>
        );
      })}
    </Slider.Root>
  );
}

function defaultThumbLabel(index: number, total: number): string {
  if (total === 2) return index === 0 ? "Minimum" : "Maximum";
  return `Value ${index + 1} of ${total}`;
}
