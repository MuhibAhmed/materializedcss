"use client";

import * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import {
  hasFieldError,
  Input,
  TextFieldFooter,
  TextFieldLabel,
  TextFieldRoot,
  textFieldDescribedBy,
  useMergedRefs,
} from "@/components/ui/text-field";
import { useRipple } from "@/hooks/use-ripple";
import { cn, composeEventHandlers } from "@/lib/utils";

/** True when `file` matches an `accept` attribute value (".pdf,image/*,text/plain"). */
export function fileMatchesAccept(file: File, accept: string | undefined): boolean {
  if (!accept) return true;
  const tokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

export interface FileInputProps extends Omit<React.ComponentProps<"input">, "type" | "value" | "defaultValue" | "prefix"> {
  /** Floating label of the path field. */
  label?: React.ReactNode;
  /** Placeholder of the path field (Materialize "Upload one or more files"). */
  placeholder?: string;
  /** Text (or icon + text) of the button. */
  buttonLabel?: React.ReactNode;
  /** Helper text under the field. */
  helperText?: React.ReactNode;
  /** `true` or an error message. Sets `aria-invalid`; a message replaces the helper text. */
  error?: React.ReactNode;
  /** Called with the selected files after every change (picker, drop, clear or form reset). */
  onFilesChange?: ((files: File[]) => void) | undefined;
  /** Show a button that clears the selection. */
  clearable?: boolean;
  /** Accept files dropped onto the field. */
  dropzone?: boolean;
  /** Format the path text. Defaults to the comma-separated file names. */
  formatFiles?: ((files: File[]) => string) | undefined;
  /** Class for the button. `className` goes on the wrapper. */
  buttonClassName?: string;
  /** Class for the read-only path input. */
  pathClassName?: string;
}

/**
 * Materialize file field: a raised "File" button next to a read-only path field that lists the
 * selected file names. The real `<input type="file">` stays in the tab order (visually hidden),
 * so it works with the keyboard, screen readers, forms and drag and drop.
 */
export function FileInput({
  id: idProp,
  label,
  placeholder,
  buttonLabel = "File",
  helperText,
  error,
  onFilesChange,
  clearable = false,
  dropzone = true,
  formatFiles,
  className,
  buttonClassName,
  pathClassName,
  disabled,
  multiple,
  accept,
  onChange,
  ref,
  style,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  ...props
}: FileInputProps): React.JSX.Element {
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const buttonId = `${id}-button`;
  const labelId = `${id}-label`;
  const pathId = `${id}-path`;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [dragOver, setDragOver] = React.useState(false);
  const startRipple = useRipple<HTMLLabelElement>({ disabled: Boolean(disabled) });
  const invalid = hasFieldError(error);
  const hasLabel = label !== undefined && label !== null;

  const onFilesChangeRef = React.useRef(onFilesChange);
  React.useEffect(() => {
    onFilesChangeRef.current = onFilesChange;
  });

  const sync = React.useCallback((input: HTMLInputElement) => {
    const next = Array.from(input.files ?? []);
    setFiles(next);
    onFilesChangeRef.current?.(next);
  }, []);

  // Pick up form resets (the browser clears the input without a change event).
  const resetRef = React.useCallback(
    (node: HTMLInputElement | null): (() => void) | undefined => {
      const form = node?.form;
      if (!node || !form) return undefined;
      const onReset = (): void => {
        window.setTimeout(() => sync(node), 0);
      };
      form.addEventListener("reset", onReset);
      return () => form.removeEventListener("reset", onReset);
    },
    [sync],
  );
  const mergedRef = useMergedRefs<HTMLInputElement>(ref, inputRef, resetRef);

  const setInputFiles = (list: File[]): void => {
    const input = inputRef.current;
    if (!input) return;
    const transfer = new DataTransfer();
    for (const file of list) transfer.items.add(file);
    input.files = transfer.files;
    // Let React (and any listener) see the change like a normal pick.
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const clear = (): void => {
    const input = inputRef.current;
    if (!input) return;
    input.value = "";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.focus();
  };

  const pathText = files.length === 0 ? "" : formatFiles ? formatFiles(files) : files.map((file) => file.name).join(", ");

  const dropHandlers: Pick<React.ComponentProps<"div">, "onDragEnter" | "onDragOver" | "onDragLeave" | "onDrop"> =
    dropzone && !disabled
      ? {
          onDragEnter: (event) => {
            if (!event.dataTransfer.types.includes("Files")) return;
            event.preventDefault();
            setDragOver(true);
          },
          onDragOver: (event) => {
            if (!event.dataTransfer.types.includes("Files")) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            setDragOver(true);
          },
          onDragLeave: (event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
            setDragOver(false);
          },
          onDrop: (event) => {
            event.preventDefault();
            setDragOver(false);
            const dropped = Array.from(event.dataTransfer.files).filter((file) => fileMatchesAccept(file, accept));
            if (dropped.length === 0) return;
            setInputFiles(multiple ? dropped : dropped.slice(0, 1));
          },
        }
      : {};

  return (
    <TextFieldRoot
      data-slot="file-input"
      data-drag-over={dragOver ? "true" : undefined}
      className={cn("rounded-ui", dragOver && "bg-secondary/8 outline-2 outline-offset-4 outline-secondary outline-dashed", className)}
      style={style}
      {...dropHandlers}
    >
      <div className="flex items-start gap-2.5">
        <input
          ref={mergedRef}
          id={id}
          type="file"
          data-slot="file-input-native"
          disabled={disabled}
          multiple={multiple}
          accept={accept}
          aria-labelledby={hasLabel ? `${buttonId} ${labelId}` : buttonId}
          aria-invalid={invalid ? true : ariaInvalidProp}
          aria-describedby={textFieldDescribedBy({ id, helperText, error, describedBy: describedByProp })}
          className="peer/file sr-only"
          onChange={composeEventHandlers(onChange, (event: React.ChangeEvent<HTMLInputElement>) => sync(event.currentTarget))}
          {...props}
        />
        <label
          id={buttonId}
          htmlFor={id}
          data-slot="file-input-button"
          data-disabled={disabled ? "" : undefined}
          onPointerDown={startRipple}
          className={cn(
            buttonVariants(),
            "h-12 shrink-0 px-5",
            "peer-focus-visible/file:focus-ring peer-focus-visible/file:shadow-z1-half peer-focus-visible/file:after:opacity-[0.12]",
            "data-[disabled]:pointer-events-none data-[disabled]:cursor-default data-[disabled]:bg-disabled data-[disabled]:text-disabled-foreground data-[disabled]:shadow-none",
            buttonClassName,
          )}
        >
          {buttonLabel}
        </label>
        <div className="relative min-w-0 flex-1">
          <Input
            id={pathId}
            readOnly
            tabIndex={-1}
            disabled={disabled}
            value={pathText}
            placeholder={placeholder ?? " "}
            aria-label={hasLabel ? undefined : "Selected files"}
            aria-labelledby={hasLabel ? labelId : undefined}
            status={invalid ? "error" : "default"}
            data-slot="file-input-path"
            title={pathText || undefined}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "cursor-pointer truncate",
              dragOver && "border-secondary shadow-[0_1px_0_0_var(--secondary)]",
              clearable && files.length > 0 && "pr-8",
              // Mirror the focus of the hidden file input on the path underline.
              "group-has-[[data-slot=file-input-native]:focus-visible]/tf:border-secondary group-has-[[data-slot=file-input-native]:focus-visible]/tf:shadow-[0_1px_0_0_var(--secondary)]",
              pathClassName,
            )}
          />
          {hasLabel ? (
            <TextFieldLabel
              id={labelId}
              htmlFor={id}
              floating={placeholder !== undefined || files.length > 0}
              className="group-has-[[data-slot=file-input-native]:focus-visible]/tf:text-secondary"
            >
              {label}
            </TextFieldLabel>
          ) : null}
          {clearable && files.length > 0 && !disabled ? (
            <button
              type="button"
              aria-label={files.length > 1 ? "Clear selected files" : "Clear selected file"}
              onClick={clear}
              className="absolute top-3 right-0 inline-flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-surface-hover hover:text-foreground focus-visible:focus-ring"
            >
              <CloseIcon className="size-5" />
            </button>
          ) : null}
          <TextFieldFooter fieldId={id} helperText={helperText} error={error} />
        </div>
      </div>
    </TextFieldRoot>
  );
}
