"use client";

import * as React from "react";

import {
  hasFieldError,
  TextFieldFooter,
  TextFieldLabel,
  TextFieldPrefix,
  TextFieldRoot,
  textFieldControlVariants,
  textFieldDescribedBy,
  useCharacterCount,
  useMergedRefs,
  type TextFieldVariant,
} from "@/components/ui/text-field";
import { cn, composeEventHandlers } from "@/lib/utils";

/** Line height and vertical padding (rem) used to turn rows into heights. */
const LINE_REM = 1.5;
const PADDING_REM = { standard: 1.6, outlined: 2 } as const;

export interface TextareaProps extends Omit<React.ComponentProps<"textarea">, "prefix"> {
  /** Floating label. */
  label?: React.ReactNode;
  /** Helper text under the field. */
  helperText?: React.ReactNode;
  /** `true` or an error message. Sets `aria-invalid`; a message replaces the helper text and is announced. */
  error?: React.ReactNode;
  /** Show the success (valid) state. */
  success?: boolean;
  /** Color from native constraint validation after the user interacts (`:user-invalid`). */
  validate?: boolean;
  /** Leading icon. */
  prefix?: React.ReactNode;
  /** Visual style: Materialize underline (`standard`) or `outlined`. */
  variant?: TextFieldVariant;
  /** Show an `n/maxLength` character counter (requires `maxLength`). */
  showCount?: boolean;
  /** Set the native `maxlength`. When `false` the user can type past the limit and the counter turns red. */
  enforceMaxLength?: boolean;
  /** Grow with the content (Materialize `.materialize-textarea`). */
  autoResize?: boolean;
  /** Minimum visible rows. */
  minRows?: number;
  /** Maximum rows before the textarea scrolls. Unlimited by default. */
  maxRows?: number;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  /** Class for the `<textarea>`. `className` goes on the wrapper. */
  textareaClassName?: string;
  /** Class for the `<label>`. */
  labelClassName?: string;
}

/** True when the browser sizes form controls to their content natively. */
function supportsFieldSizing(): boolean {
  return typeof CSS !== "undefined" && CSS.supports("field-sizing", "content");
}

/**
 * Materialize auto-resizing textarea. Uses CSS `field-sizing: content` where supported and a
 * scrollHeight + ResizeObserver fallback elsewhere. Shares the floating label, helper text and
 * counter with `TextField`.
 */
export function Textarea({
  id: idProp,
  label,
  helperText,
  error,
  success = false,
  validate = false,
  prefix,
  variant = "standard",
  showCount = false,
  enforceMaxLength = true,
  autoResize = true,
  minRows = 1,
  maxRows,
  fullWidth = true,
  className,
  textareaClassName,
  labelClassName,
  maxLength,
  placeholder,
  value,
  defaultValue,
  onChange,
  rows,
  ref,
  style,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  ...props
}: TextareaProps): React.JSX.Element {
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const localRef = React.useRef<HTMLTextAreaElement>(null);
  const [count, countOnChange, countRef] = useCharacterCount<HTMLTextAreaElement>(value, defaultValue);
  const mergedRef = useMergedRefs<HTMLTextAreaElement>(ref, countRef, localRef);
  const counting = showCount && maxLength !== undefined;
  const invalid = hasFieldError(error) || (counting && count > maxLength);
  const hasPrefix = prefix !== undefined && prefix !== null;

  const padding = PADDING_REM[variant];
  const minHeight = `${(rows ?? minRows) * LINE_REM + padding}rem`;
  const maxHeight = maxRows !== undefined ? `${maxRows * LINE_REM + padding}rem` : undefined;

  // Fallback auto-resize for browsers without `field-sizing: content`.
  const resize = React.useCallback(() => {
    const node = localRef.current;
    if (!node || !autoResize || supportsFieldSizing()) return;
    node.style.height = "auto";
    const border = node.offsetHeight - node.clientHeight;
    node.style.height = `${node.scrollHeight + border}px`;
  }, [autoResize]);

  React.useLayoutEffect(() => {
    resize();
  }, [resize, value]);

  React.useEffect(() => {
    const node = localRef.current;
    if (!node || !autoResize || supportsFieldSizing() || typeof ResizeObserver === "undefined") return undefined;
    let lastWidth = node.clientWidth;
    const observer = new ResizeObserver(() => {
      if (node.clientWidth === lastWidth) return;
      lastWidth = node.clientWidth;
      resize();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [autoResize, resize]);

  return (
    <TextFieldRoot variant={variant} fullWidth={fullWidth} className={className} style={style}>
      {hasPrefix ? <TextFieldPrefix variant={variant}>{prefix}</TextFieldPrefix> : null}
      <textarea
        ref={mergedRef}
        id={id}
        data-slot="textarea"
        data-status={success && !invalid ? "success" : undefined}
        placeholder={placeholder ?? " "}
        maxLength={enforceMaxLength ? maxLength : undefined}
        value={value}
        defaultValue={defaultValue}
        rows={rows ?? minRows}
        onChange={composeEventHandlers(onChange, countOnChange, () => resize())}
        aria-invalid={invalid ? true : ariaInvalidProp}
        aria-describedby={textFieldDescribedBy({ id, helperText, error, showCount: counting, describedBy: describedByProp })}
        style={{ minHeight, maxHeight }}
        className={cn(
          textFieldControlVariants({ variant, prefix: hasPrefix, validate }),
          "h-auto resize-none leading-6",
          variant === "standard" ? "py-[0.8rem]" : "py-4",
          autoResize && "field-sizing-content",
          maxHeight ? "overflow-y-auto" : "overflow-y-hidden",
          textareaClassName,
        )}
        {...props}
      />
      {label !== undefined && label !== null ? (
        <TextFieldLabel
          htmlFor={id}
          variant={variant}
          hasPrefix={hasPrefix}
          floating={placeholder !== undefined}
          validate={validate}
          className={labelClassName}
        >
          {label}
        </TextFieldLabel>
      ) : null}
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
