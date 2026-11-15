"use client";

import * as React from "react";
import { cva } from "class-variance-authority";

import { cn, composeEventHandlers } from "@/lib/utils";

/* -------------------------------------------------------------------------------------------------
 * Shared building blocks. Textarea, Select, Autocomplete and ChipsInput import these so every form
 * control has the same underline, floating label, helper text and counter.
 * -----------------------------------------------------------------------------------------------*/

/** Visual style of a text field: Materialize's underline (`standard`) or a new `outlined` box. */
export type TextFieldVariant = "standard" | "outlined";

/** Validation status of a field. `error` also sets `aria-invalid`. */
export type TextFieldStatus = "default" | "success" | "error";

/**
 * Classes for the field control (input, textarea, select trigger). The control must be rendered
 * before its `TextFieldLabel` so the label can float with pure CSS (`peer` selectors).
 */
export const textFieldControlVariants = cva(
  [
    "peer block w-full min-w-0 appearance-none bg-transparent text-base text-foreground shadow-none outline-none",
    "transition-[box-shadow,border-color] duration-300 motion-reduce:transition-none",
    "placeholder:text-foreground/40",
    "disabled:cursor-default disabled:border-dotted disabled:border-foreground/40 disabled:text-foreground/45",
    "aria-invalid:border-error aria-invalid:focus:border-error",
    "data-[status=success]:border-success",
  ],
  {
    variants: {
      variant: {
        standard: [
          "m-0 mb-2 h-12 rounded-none border-0 border-b border-input p-0",
          "focus:border-secondary focus:shadow-[0_1px_0_0_var(--secondary)]",
          "aria-invalid:shadow-[0_1px_0_0_var(--error)] data-[status=success]:shadow-[0_1px_0_0_var(--success)]",
        ],
        outlined: [
          "m-0 mb-1 h-14 rounded-ui border border-input px-3",
          "hover:border-foreground/60 focus:border-secondary focus:shadow-[inset_0_0_0_1px_var(--secondary)]",
          "aria-invalid:shadow-[inset_0_0_0_1px_var(--error)] data-[status=success]:shadow-[inset_0_0_0_1px_var(--success)]",
        ],
      },
      prefix: { true: "", false: "" },
      suffix: { true: "", false: "" },
      /** Color from native constraint validation once the user has interacted (`:user-invalid` / `:user-valid`). */
      validate: { true: "[&:user-invalid]:border-error [&:user-valid]:border-success", false: "" },
    },
    compoundVariants: [
      {
        variant: "standard",
        validate: true,
        className: "[&:user-invalid]:shadow-[0_1px_0_0_var(--error)] [&:user-valid]:shadow-[0_1px_0_0_var(--success)]",
      },
      {
        variant: "outlined",
        validate: true,
        className:
          "[&:user-invalid]:shadow-[inset_0_0_0_1px_var(--error)] [&:user-valid]:shadow-[inset_0_0_0_1px_var(--success)]",
      },
      { variant: "standard", prefix: true, className: "ml-12 w-[calc(100%-3rem)]" },
      { variant: "outlined", prefix: true, className: "pl-12" },
      { variant: "standard", suffix: true, className: "pr-8" },
      { variant: "outlined", suffix: true, className: "pr-10" },
    ],
    defaultVariants: { variant: "standard", prefix: false, suffix: false, validate: false },
  },
);

/**
 * Floating label classes. Floats when the previous `peer` control is focused, has a value
 * (`:not(:placeholder-shown)`), is autofilled, has focus inside, or when `data-float="true"`.
 * No JavaScript is needed, so autofilled and programmatically set values never overlap the label.
 */
export const textFieldLabelVariants = cva(
  [
    "pointer-events-none absolute top-0 z-[1] max-w-[calc(100%-1rem)] origin-top-left truncate text-base leading-6 text-muted-foreground",
    "translate-y-(--tf-label-y) transition-[translate,scale,color] duration-200 ease-out motion-reduce:transition-none",
    // Float triggers.
    "peer-focus:translate-y-(--tf-label-float-y) peer-focus:scale-80",
    "peer-focus-within:translate-y-(--tf-label-float-y) peer-focus-within:scale-80",
    "peer-[:not(:placeholder-shown)]:translate-y-(--tf-label-float-y) peer-[:not(:placeholder-shown)]:scale-80",
    "peer-autofill:translate-y-(--tf-label-float-y) peer-autofill:scale-80",
    "peer-[:-webkit-autofill]:translate-y-(--tf-label-float-y) peer-[:-webkit-autofill]:scale-80",
    "data-[float=true]:translate-y-(--tf-label-float-y) data-[float=true]:scale-80",
    // Colors.
    "peer-disabled:text-foreground/45 peer-data-[disabled]:text-foreground/45",
    "peer-aria-invalid:text-error! peer-data-[status=success]:text-success!",
  ],
  {
    variants: {
      variant: {
        standard: "left-0 [--tf-label-float-y:-14px] [--tf-label-y:12px]",
        outlined:
          "left-2.5 bg-(--tf-label-bg) px-1 [--tf-label-bg:var(--background)] [--tf-label-float-y:-10px] [--tf-label-y:16px]",
      },
      prefix: { true: "", false: "" },
      /** Follow native constraint validation (see `textFieldControlVariants`). */
      validate: { true: "peer-[:user-invalid]:text-error! peer-[:user-valid]:text-success!", false: "" },
      /** Turns off the secondary color on focus (used when focus moves into a popup). */
      focusColor: {
        true: "peer-focus:text-secondary peer-focus-within:text-secondary peer-data-[state=open]:text-secondary",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "standard", prefix: true, className: "left-12" },
      { variant: "outlined", prefix: true, className: "left-10.5" },
    ],
    defaultVariants: { variant: "standard", prefix: false, focusColor: true, validate: false },
  },
);

/** Input types whose UI always shows a value, so the label must stay floated. */
const ALWAYS_FLOATING_TYPES = new Set(["date", "time", "datetime-local", "month", "week", "color", "file", "range"]);

/** True for an `error` prop value that marks the field invalid. */
export function hasFieldError(error: React.ReactNode): boolean {
  return error !== undefined && error !== null && error !== false && error !== "";
}

/** Ids of the helper, error and counter elements of the field with control id `id`. */
export function textFieldIds(id: string): { helper: string; error: string; counter: string } {
  return { helper: `${id}-helper`, error: `${id}-error`, counter: `${id}-counter` };
}

/** Join `aria-describedby` id lists, dropping empty entries. */
export function joinIds(...ids: Array<string | false | null | undefined>): string | undefined {
  const joined = ids.filter(Boolean).join(" ").trim();
  return joined.length > 0 ? joined : undefined;
}

export interface TextFieldDescriptionOptions {
  /** Id of the control. */
  id: string;
  /** Whether helper text is rendered. */
  helperText?: React.ReactNode;
  /** Error value (`true` or a message). */
  error?: React.ReactNode;
  /** Whether a character counter is rendered. */
  showCount?: boolean;
  /** Extra ids passed by the user via `aria-describedby`. */
  describedBy?: string | undefined;
}

/** Build the `aria-describedby` value for a field (user ids, then error or helper, then counter). */
export function textFieldDescribedBy({
  id,
  helperText,
  error,
  showCount,
  describedBy,
}: TextFieldDescriptionOptions): string | undefined {
  const ids = textFieldIds(id);
  const message = hasFieldError(error) && typeof error !== "boolean";
  return joinIds(
    describedBy,
    message ? ids.error : helperText !== undefined && helperText !== null && helperText !== false ? ids.helper : null,
    showCount ? ids.counter : null,
  );
}

/**
 * Tracks the character count of a text control, for controlled values, typing and form resets.
 * Returns `[count, onChange handler, ref callback]`.
 */
export function useCharacterCount<E extends HTMLInputElement | HTMLTextAreaElement>(
  value: unknown,
  defaultValue: unknown,
): [number, (event: React.ChangeEvent<E>) => void, (node: E | null) => void] {
  const [uncontrolledCount, setCount] = React.useState(() => String(defaultValue ?? "").length);
  const count = value !== undefined && value !== null ? String(value).length : uncontrolledCount;
  const onChange = React.useCallback((event: React.ChangeEvent<E>) => setCount(event.currentTarget.value.length), []);
  const ref = React.useCallback((node: E | null): (() => void) | undefined => {
    if (!node) return undefined;
    setCount(node.value.length);
    const form = node.form;
    if (!form) return undefined;
    const onReset = (): void => {
      window.setTimeout(() => setCount(node.value.length), 0);
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);
  return [count, onChange, ref];
}

/** Merge several refs (React 19 cleanup-returning callback refs included) into one callback ref. */
export function useMergedRefs<T>(...refs: Array<React.Ref<T> | undefined>): (node: T | null) => () => void {
  return React.useCallback((node: T | null) => {
    const cleanups: Array<() => void> = [];
    for (const ref of refs) {
      if (typeof ref === "function") {
        const cleanup = ref(node);
        cleanups.push(typeof cleanup === "function" ? cleanup : () => ref(null));
      } else if (ref) {
        ref.current = node;
        cleanups.push(() => {
          ref.current = null;
        });
      }
    }
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, refs);
}

/* -------------------------------------------------------------------------------------------------
 * Parts
 * -----------------------------------------------------------------------------------------------*/

export interface TextFieldRootProps extends React.ComponentProps<"div"> {
  /** Visual style. */
  variant?: TextFieldVariant;
  /** Stretch to the width of the container (Materialize default). */
  fullWidth?: boolean;
}

/** Positioning wrapper for a field (Materialize `.input-field`). */
export function TextFieldRoot({ className, variant = "standard", fullWidth = true, ...props }: TextFieldRootProps): React.JSX.Element {
  return (
    <div
      data-slot="text-field"
      data-variant={variant}
      className={cn("group/tf relative mt-4 mb-2 text-left", fullWidth ? "w-full" : "inline-block w-auto align-top", className)}
      {...props}
    />
  );
}

export interface TextFieldLabelProps extends React.ComponentProps<"label"> {
  /** Visual style; must match the control. */
  variant?: TextFieldVariant;
  /** Offset the label for a prefix icon. */
  hasPrefix?: boolean;
  /** Force the floated position (placeholder shown, value in a non-input control...). */
  floating?: boolean;
  /** Color the label with the secondary color while the control is focused. */
  focusColor?: boolean;
  /** Follow native constraint validation of the control. */
  validate?: boolean;
}

/** Floating label. Render it right after the control. */
export function TextFieldLabel({
  className,
  variant = "standard",
  hasPrefix = false,
  floating = false,
  focusColor = true,
  validate = false,
  ...props
}: TextFieldLabelProps): React.JSX.Element {
  return (
    <label
      data-slot="text-field-label"
      data-float={floating ? "true" : undefined}
      className={cn(textFieldLabelVariants({ variant, prefix: hasPrefix, focusColor, validate }), className)}
      {...props}
    />
  );
}

export interface TextFieldAdornmentProps extends React.ComponentProps<"span"> {
  /** Visual style; must match the control. */
  variant?: TextFieldVariant;
}

/** Leading icon (Materialize `.prefix`). Turns secondary while the field has focus. */
export function TextFieldPrefix({ className, variant = "standard", ...props }: TextFieldAdornmentProps): React.JSX.Element {
  return (
    <span
      data-slot="text-field-prefix"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute flex items-center justify-center text-muted-foreground transition-colors duration-200",
        "group-focus-within/tf:text-secondary group-has-[[aria-invalid=true]]/tf:text-error",
        variant === "standard"
          ? "top-2 left-0 h-8 w-12 text-[2rem] [&_svg]:size-8"
          : "top-4 left-3 h-6 w-6 text-2xl [&_svg]:size-6",
        className,
      )}
      {...props}
    />
  );
}

/** Trailing element (icon or small button) inside the field. */
export function TextFieldSuffix({ className, variant = "standard", ...props }: TextFieldAdornmentProps): React.JSX.Element {
  return (
    <span
      data-slot="text-field-suffix"
      className={cn(
        "absolute flex items-center justify-center text-muted-foreground [&_svg]:size-6",
        variant === "standard" ? "top-0 right-0 h-12" : "top-0 right-2 h-14",
        className,
      )}
      {...props}
    />
  );
}

export interface TextFieldFooterProps extends React.ComponentProps<"div"> {
  /** Control id; helper, error and counter ids derive from it (see `textFieldIds`). */
  fieldId: string;
  /** Helper text shown under the field. */
  helperText?: React.ReactNode;
  /** `true` or an error message. A message replaces the helper text and is announced. */
  error?: React.ReactNode;
  /** Current character count; renders the counter when `maxLength` is set. */
  count?: number | undefined;
  /** Character limit for the counter. */
  maxLength?: number | undefined;
  /** Offset for a prefix icon. */
  hasPrefix?: boolean;
  /** Visual style; must match the control. */
  variant?: TextFieldVariant;
}

/** Helper text, error message and character counter row. Renders nothing when empty. */
export function TextFieldFooter({
  fieldId,
  helperText,
  error,
  count,
  maxLength,
  hasPrefix = false,
  variant = "standard",
  className,
  ...props
}: TextFieldFooterProps): React.JSX.Element | null {
  const ids = textFieldIds(fieldId);
  const errorMessage = hasFieldError(error) && typeof error !== "boolean" ? error : null;
  const hasHelper = helperText !== undefined && helperText !== null && helperText !== false;
  const showCounter = count !== undefined && maxLength !== undefined;
  const over = showCounter && count > maxLength;

  // Announce the count politely, but only after typing pauses (not on every keystroke).
  const [announcement, setAnnouncement] = React.useState("");
  const firstRender = React.useRef(true);
  React.useEffect(() => {
    if (!showCounter) return undefined;
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setAnnouncement(
        count > maxLength
          ? `${count - maxLength} characters over the limit of ${maxLength}`
          : `${count} of ${maxLength} characters used`,
      );
    }, 700);
    return () => window.clearTimeout(timer);
  }, [count, maxLength, showCounter]);

  if (!errorMessage && !hasHelper && !showCounter) return null;

  return (
    <div
      data-slot="text-field-footer"
      className={cn(
        "flex min-h-[18px] items-start gap-4 text-xs leading-[18px]",
        hasPrefix && (variant === "standard" ? "ml-12" : "pl-3"),
        variant === "outlined" && !hasPrefix && "px-3",
        className,
      )}
      {...props}
    >
      {errorMessage ? (
        <p id={ids.error} role="alert" data-slot="text-field-error" className="m-0 flex-1 text-error">
          {errorMessage}
        </p>
      ) : hasHelper ? (
        <p id={ids.helper} data-slot="text-field-helper" className="m-0 flex-1 text-muted-foreground">
          {helperText}
        </p>
      ) : (
        <span className="flex-1" />
      )}
      {showCounter ? (
        <>
          <span
            id={ids.counter}
            data-slot="text-field-counter"
            data-over={over ? "true" : undefined}
            className={cn("ml-auto shrink-0 tabular-nums text-muted-foreground", over && "text-error")}
          >
            <span aria-hidden="true">
              {count}/{maxLength}
            </span>
            <span className="sr-only">Maximum {maxLength} characters</span>
          </span>
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {announcement}
          </span>
        </>
      ) : null}
    </div>
  );
}

export interface InputProps extends Omit<React.ComponentProps<"input">, "prefix"> {
  /** Visual style. */
  variant?: TextFieldVariant;
  /** Validation status (`error` sets `aria-invalid`). */
  status?: TextFieldStatus;
  /** Leave room for a prefix icon. */
  hasPrefix?: boolean;
  /** Leave room for a suffix element. */
  hasSuffix?: boolean;
}

/** Bare Materialize input (underline only). Use `TextField` for label, helper and counter. */
export function Input({
  className,
  variant = "standard",
  status = "default",
  hasPrefix = false,
  hasSuffix = false,
  type = "text",
  ...props
}: InputProps): React.JSX.Element {
  return (
    <input
      data-slot="input"
      type={type}
      data-status={status === "default" ? undefined : status}
      aria-invalid={status === "error" ? true : props["aria-invalid"]}
      className={cn(textFieldControlVariants({ variant, prefix: hasPrefix, suffix: hasSuffix }), className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * TextField
 * -----------------------------------------------------------------------------------------------*/

export interface TextFieldProps extends Omit<React.ComponentProps<"input">, "prefix"> {
  /** Floating label. */
  label?: React.ReactNode;
  /** Helper text under the field. */
  helperText?: React.ReactNode;
  /** `true` or an error message. Sets `aria-invalid`; a message replaces the helper text and is announced. */
  error?: React.ReactNode;
  /** Show the success (valid) state. */
  success?: boolean;
  /** Color the field from native constraint validation after the user interacts (`:user-invalid`), like Materialize `.validate`. */
  validate?: boolean;
  /** Leading icon (Materialize `.prefix`). */
  prefix?: React.ReactNode;
  /** Trailing element, e.g. an icon button. */
  suffix?: React.ReactNode;
  /** Visual style: Materialize underline (`standard`) or `outlined`. */
  variant?: TextFieldVariant;
  /** Show an `n/maxLength` character counter (requires `maxLength`). */
  showCount?: boolean;
  /**
   * Set the native `maxlength` attribute. When `false` the user can type past `maxLength` and the
   * counter turns red instead (Materialize `data-length` behavior).
   */
  enforceMaxLength?: boolean;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  /** Class for the `<input>`. `className` goes on the wrapper. */
  inputClassName?: string;
  /** Class for the `<label>`. */
  labelClassName?: string;
}

/**
 * Materialize text input with a CSS-only floating label, prefix icon, helper and error text,
 * character counter and success/error states.
 */
export function TextField({
  id: idProp,
  label,
  helperText,
  error,
  success = false,
  validate = false,
  prefix,
  suffix,
  variant = "standard",
  showCount = false,
  enforceMaxLength = true,
  fullWidth = true,
  className,
  inputClassName,
  labelClassName,
  maxLength,
  placeholder,
  type = "text",
  value,
  defaultValue,
  onChange,
  ref,
  style,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  ...props
}: TextFieldProps): React.JSX.Element {
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const [count, countOnChange, countRef] = useCharacterCount<HTMLInputElement>(value, defaultValue);
  const mergedRef = useMergedRefs<HTMLInputElement>(ref, countRef);
  const counting = showCount && maxLength !== undefined;
  const over = counting && count > maxLength;
  const invalid = hasFieldError(error) || over;
  const hasPrefix = prefix !== undefined && prefix !== null;
  const hasSuffix = suffix !== undefined && suffix !== null;

  return (
    <TextFieldRoot variant={variant} fullWidth={fullWidth} className={className} style={style}>
      {hasPrefix ? <TextFieldPrefix variant={variant}>{prefix}</TextFieldPrefix> : null}
      <input
        ref={mergedRef}
        id={id}
        type={type}
        data-slot="input"
        data-status={success && !invalid ? "success" : undefined}
        placeholder={placeholder ?? " "}
        maxLength={enforceMaxLength ? maxLength : undefined}
        value={value}
        defaultValue={defaultValue}
        onChange={composeEventHandlers(onChange, countOnChange)}
        aria-invalid={invalid ? true : ariaInvalidProp}
        aria-describedby={textFieldDescribedBy({ id, helperText, error, showCount: counting, describedBy: describedByProp })}
        className={cn(textFieldControlVariants({ variant, prefix: hasPrefix, suffix: hasSuffix, validate }), inputClassName)}
        {...props}
      />
      {label !== undefined && label !== null ? (
        <TextFieldLabel
          htmlFor={id}
          variant={variant}
          hasPrefix={hasPrefix}
          floating={placeholder !== undefined || ALWAYS_FLOATING_TYPES.has(type)}
          validate={validate}
          className={labelClassName}
        >
          {label}
        </TextFieldLabel>
      ) : null}
      {hasSuffix ? <TextFieldSuffix variant={variant}>{suffix}</TextFieldSuffix> : null}
      <TextFieldFooter
        fieldId={id}
        variant={variant}
        hasPrefix={hasPrefix}
        helperText={helperText}
        error={error}
        count={counting ? count : undefined}
        maxLength={counting ? maxLength : undefined}
      />
    </TextFieldRoot>
  );
}
