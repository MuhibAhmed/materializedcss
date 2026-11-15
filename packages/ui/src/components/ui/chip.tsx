"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** Keep only image URLs with a safe scheme (http(s), blob, data:image/* or relative). */
function safeImageSrc(src: string | undefined): string | undefined {
  if (!src) return undefined;
  const trimmed = src.trim();
  if (/^data:image\//i.test(trimmed) || /^(https?:|blob:)/i.test(trimmed)) return trimmed;
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? undefined : trimmed;
}

export interface ChipProps extends React.ComponentProps<"div"> {
  /** Avatar image URL shown as a 32px circle before the label. Unsafe schemes (`javascript:`...) are dropped. */
  image?: string;
  /** Alt text for `image`. Decorative (empty) by default. */
  imageAlt?: string;
  /** Selected / active state (secondary background). */
  selected?: boolean;
  /** Shows a close button that calls this handler. */
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Accessible name of the close button. Defaults to `Remove <text>` for text children. */
  deleteLabel?: string;
  /** Extra props for the close button (e.g. `tabIndex={-1}` when the chip itself handles Delete). */
  deleteButtonProps?: React.ComponentProps<"button">;
  /**
   * Merge chip styling onto the single child element (e.g. a `<button aria-pressed>` or a link).
   * Don't combine with `onDelete`, which would nest interactive elements.
   */
  asChild?: boolean;
  /** Disabled look; also disables the close button. */
  disabled?: boolean;
}

/** Text content of simple children, used for the default close-button label. */
function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  return "";
}

/**
 * Materialize chip: a 32px pill for tags, contacts or filters, with an optional avatar image and
 * close button.
 */
export function Chip({
  className,
  image,
  imageAlt = "",
  selected = false,
  onDelete,
  deleteLabel,
  deleteButtonProps,
  asChild = false,
  disabled = false,
  children,
  ...props
}: ChipProps): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "div";
  const src = safeImageSrc(image);
  const label = deleteLabel ?? `Remove ${textOf(children)}`.trim();

  return (
    <Comp
      data-slot="chip"
      data-selected={selected ? "true" : undefined}
      data-disabled={disabled ? "" : undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        "inline-flex h-8 max-w-full shrink-0 select-none items-center rounded-2xl bg-black/10 px-3 align-middle text-[13px] font-medium leading-8 text-muted-foreground dark:bg-white/12",
        "outline-none transition-[background-color,color] duration-200 motion-reduce:transition-none",
        "focus-visible:bg-secondary focus-visible:text-secondary-foreground",
        "data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-foreground",
        "data-[disabled]:opacity-60",
        asChild && "cursor-pointer hover:bg-black/15 dark:hover:bg-white/18",
        className,
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={imageAlt}
          data-slot="chip-image"
          className="-ml-3 mr-2 size-8 shrink-0 rounded-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : null}
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : <span className="truncate">{children}</span>}
      {onDelete ? (
        <button
          type="button"
          aria-label={label}
          data-slot="chip-delete"
          disabled={disabled}
          {...deleteButtonProps}
          onClick={(event) => {
            deleteButtonProps?.onClick?.(event);
            if (!event.defaultPrevented) onDelete(event);
          }}
          className={cn(
            "-mr-1 ml-2 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-current opacity-80 outline-none",
            "hover:opacity-100 focus-visible:focus-ring disabled:cursor-default",
            deleteButtonProps?.className,
          )}
        >
          <CloseIcon size={16} />
        </button>
      ) : null}
    </Comp>
  );
}
