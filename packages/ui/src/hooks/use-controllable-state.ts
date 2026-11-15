"use client";

import * as React from "react";

export interface UseControllableStateParams<T> {
  /** Controlled value. When defined the hook mirrors it and never stores its own copy. */
  value?: T | undefined;
  /** Initial value for uncontrolled usage. */
  defaultValue: T;
  /** Called whenever the value changes, in both modes. */
  onChange?: ((value: T) => void) | undefined;
}

/**
 * State that works both controlled (`value` + `onChange`) and uncontrolled
 * (`defaultValue`). Fixes Materialize's main framework pain point: values set
 * from outside were never reflected in the widget.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, (next: T | ((prev: T) => T)) => void] {
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolled;

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  });
  const currentRef = React.useRef(current);
  currentRef.current = current;

  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(currentRef.current) : next;
      if (Object.is(resolved, currentRef.current)) return;
      if (!isControlled) setUncontrolled(resolved);
      onChangeRef.current?.(resolved);
    },
    [isControlled],
  );

  return [current, setValue];
}
