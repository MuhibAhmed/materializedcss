"use client";

import * as React from "react";
import { Dialog } from "radix-ui";

import { getDefaultLocale } from "@/lib/date";
import { cn } from "@/lib/utils";

const subscribeNoop = (): (() => void) => () => {};

/** The given locale, or `navigator.language` after hydration ("en-US" on the server). */
export function usePickerLocale(locale?: string): string {
  const detected = React.useSyncExternalStore(subscribeNoop, getDefaultLocale, () => "en-US");
  return locale ?? detected;
}

/** Combine several refs (object or callback) into one callback ref. */
export function mergePickerRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.RefObject<T | null>).current = node;
    }
  };
}

export interface PickerInputProps extends Omit<React.ComponentProps<"input">, "size"> {
  /** Floating label (Materialize `.input-field label`). */
  label?: React.ReactNode;
  /** Small text under the field. */
  helperText?: React.ReactNode;
  /** Content at the end of the field, e.g. an icon button that opens the picker. */
  endAdornment?: React.ReactNode;
  /** Show the field in its error color. */
  invalid?: boolean;
  /** Class name for the field wrapper (`className` styles the `<input>`). */
  wrapperClassName?: string;
}

/**
 * Materialize-style text input used by the date and time pickers: a bottom
 * border that turns teal on focus and a label that floats above the value.
 */
export function PickerInput({
  label,
  helperText,
  endAdornment,
  invalid = false,
  wrapperClassName,
  className,
  id: idProp,
  value,
  placeholder,
  disabled,
  "aria-describedby": describedBy,
  ...props
}: PickerInputProps): React.JSX.Element {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const helperId = helperText ? `${id}-helper` : undefined;
  const floated = (value !== undefined && value !== null && String(value) !== "") || Boolean(placeholder);

  return (
    <div data-slot="picker-field" className={cn("relative mt-4 mb-2 w-full text-left rtl:text-right", wrapperClassName)}>
      <input
        id={id}
        data-slot="picker-input"
        data-float={floated || undefined}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={cn(describedBy, helperId) || undefined}
        className={cn(
          // Same box as `TextField` (h-12 + mb-2) so pickers line up with text fields and selects.
          "peer m-0 mb-2 block h-12 w-full rounded-none border-0 border-b border-solid border-input bg-transparent px-0 text-base text-foreground",
          "outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-muted-foreground",
          "focus:border-secondary focus:shadow-[0_1px_0_0_var(--secondary)]",
          "aria-invalid:border-error aria-invalid:focus:shadow-[0_1px_0_0_var(--error)]",
          "disabled:cursor-default disabled:border-dotted disabled:border-foreground/40 disabled:text-disabled-foreground",
          "read-only:focus:border-input read-only:focus:shadow-none",
          endAdornment ? "pe-10" : undefined,
          className,
        )}
        {...props}
      />
      {label ? (
        <label
          htmlFor={id}
          data-slot="picker-label"
          className={cn(
            // Same geometry as `TextFieldLabel`, so floated labels line up with text fields side by side.
            "pointer-events-none absolute start-0 top-0 origin-top-left translate-y-3 truncate text-base leading-6 text-muted-foreground",
            "transition-[translate,scale,color] duration-200 ease-out rtl:origin-top-right motion-reduce:transition-none",
            "peer-focus:-translate-y-3.5 peer-focus:scale-80 peer-focus:text-secondary",
            "peer-data-float:-translate-y-3.5 peer-data-float:scale-80",
            "peer-autofill:-translate-y-3.5 peer-autofill:scale-80 peer-[:-webkit-autofill]:-translate-y-3.5 peer-[:-webkit-autofill]:scale-80",
            "peer-read-only:peer-focus:text-muted-foreground peer-aria-invalid:text-error peer-disabled:text-disabled-foreground",
            // Keep a long label clear of the icon button.
            endAdornment ? "max-w-[calc(100%-3rem)]" : "max-w-[calc(100%-1rem)]",
          )}
        >
          {label}
        </label>
      ) : null}
      {endAdornment ? (
        <div data-slot="picker-adornment" className="absolute end-0 top-1 flex items-center">
          {endAdornment}
        </div>
      ) : null}
      {helperText ? (
        <p
          id={helperId}
          data-slot="picker-helper"
          className={cn("m-0 min-h-[18px] text-xs leading-[18px] text-muted-foreground", invalid && "text-error")}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export interface PickerIconButtonProps extends React.ComponentProps<"button"> {}

/** Round icon button placed inside a {@link PickerInput} to open the picker. */
export function PickerIconButton({ className, type, ...props }: PickerIconButtonProps): React.JSX.Element {
  return (
    <button
      data-slot="picker-icon-button"
      type={type ?? "button"}
      className={cn(
        "inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground",
        "outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:focus-ring",
        "disabled:pointer-events-none disabled:text-disabled-foreground [&_svg]:size-6",
        className,
      )}
      {...props}
    />
  );
}

export interface PickerModalProps
  extends Omit<React.ComponentProps<typeof Dialog.Content>, "title" | "onOpenAutoFocus" | "onCloseAutoFocus"> {
  /** Whether the modal is open. */
  open: boolean;
  /** Called on every close path: buttons, Esc and overlay click. */
  onOpenChange: (open: boolean) => void;
  /** Accessible dialog title (visually hidden). */
  title: string;
  /** Runs instead of Radix's default initial focus. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Runs instead of Radix's default focus return. */
  onCloseAutoFocus?: (event: Event) => void;
  /** Class name for the backdrop. */
  overlayClassName?: string;
}

/** Materialize modal shell (Radix Dialog: focus trap, Esc, overlay click, scroll lock). */
export function PickerModal({
  open,
  onOpenChange,
  title,
  children,
  className,
  overlayClassName,
  ...props
}: PickerModalProps): React.JSX.Element {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          data-slot="picker-overlay"
          className={cn(
            "fixed inset-0 z-50 bg-overlay data-[state=closed]:animate-md-fade-out data-[state=open]:animate-md-fade-in motion-reduce:animate-none",
            overlayClassName,
          )}
        />
        <Dialog.Content
          data-slot="picker-modal"
          aria-describedby={undefined}
          className={cn(
            "fixed inset-0 z-50 m-auto h-fit max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] overflow-y-auto overscroll-contain",
            "rounded-ui bg-surface text-foreground shadow-z5 outline-none",
            "data-[state=closed]:animate-md-modal-out data-[state=open]:animate-md-modal-in motion-reduce:animate-none",
            className,
          )}
          {...props}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export interface PickerFooterProps extends React.ComponentProps<"div"> {}

/** Row of flat action buttons at the bottom of a picker (Clear · Cancel · OK). */
export function PickerFooter({ className, ...props }: PickerFooterProps): React.JSX.Element {
  return (
    <div
      data-slot="picker-footer"
      className={cn("flex items-center justify-end gap-1 px-2 pt-1 pb-2 [&>[data-clear]]:me-auto", className)}
      {...props}
    />
  );
}
