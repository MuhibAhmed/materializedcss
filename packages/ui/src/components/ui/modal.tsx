"use client";

import * as React from "react";
import { Dialog } from "radix-ui";
import { cva } from "class-variance-authority";

import { useControllableState } from "@/hooks/use-controllable-state";
import { cn, composeEventHandlers } from "@/lib/utils";

interface ModalContextValue {
  open: boolean;
  dismissible: boolean;
  preventScrolling: boolean;
}

const ModalContext = React.createContext<ModalContextValue>({ open: false, dismissible: true, preventScrolling: true });

export interface ModalProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the modal opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Allow closing the modal with Escape or a click on the overlay
   * (Materialize `dismissible`). Close buttons always work.
   */
  dismissible?: boolean;
  /**
   * Lock page scrolling while the modal is open (Materialize `preventScrolling`).
   * The lock compensates for the scrollbar width and works on iOS. When `false`
   * the page behind can scroll, but focus is still kept inside the modal.
   */
  preventScrolling?: boolean;
  children?: React.ReactNode;
}

/**
 * Material modal dialog (Materialize `.modal`). Built on Radix Dialog: focus is
 * trapped and returned to the trigger, the content is labelled by its title and
 * description, and nested modals stack in the order they were opened.
 */
export function Modal({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  dismissible = true,
  preventScrolling = true,
  children,
}: ModalProps): React.JSX.Element {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const value = React.useMemo(() => ({ open, dismissible, preventScrolling }), [open, dismissible, preventScrolling]);
  return (
    <ModalContext.Provider value={value}>
      <Dialog.Root modal={preventScrolling} open={open} onOpenChange={setOpen}>
        {children}
      </Dialog.Root>
    </ModalContext.Provider>
  );
}

export type ModalTriggerProps = React.ComponentProps<typeof Dialog.Trigger>;

/** The element that opens the modal. Use `asChild` to render your own button. */
export function ModalTrigger(props: ModalTriggerProps): React.JSX.Element {
  return <Dialog.Trigger data-slot="modal-trigger" {...props} />;
}

export type ModalCloseProps = React.ComponentProps<typeof Dialog.Close>;

/** Closes the modal (Materialize `.modal-close`). Use `asChild` to render a `Button`. */
export function ModalClose(props: ModalCloseProps): React.JSX.Element {
  return <Dialog.Close data-slot="modal-close" {...props} />;
}

export const modalContentVariants = cva(
  [
    "group/modal fixed z-50 flex flex-col bg-surface-2 text-foreground shadow-z5 outline-none",
    "motion-reduce:animate-none!",
  ],
  {
    variants: {
      variant: {
        default: [
          "inset-x-0 top-[10%] mx-auto max-h-[70%] w-[90%] overflow-y-auto rounded-ui sm:w-[80%] lg:w-[55%]",
          "data-[state=open]:animate-md-modal-in data-[state=closed]:animate-md-modal-out",
        ],
        "fixed-footer": [
          "inset-x-0 top-[10%] mx-auto h-[70%] w-[90%] overflow-hidden rounded-ui sm:w-[80%] lg:w-[55%]",
          "data-[state=open]:animate-md-modal-in data-[state=closed]:animate-md-modal-out",
        ],
        "bottom-sheet": [
          "inset-x-0 bottom-0 max-h-[45%] w-full overflow-y-auto rounded-none",
          "data-[state=open]:animate-md-sheet-in data-[state=closed]:animate-md-sheet-out",
        ],
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface ModalContentProps extends React.ComponentProps<typeof Dialog.Content> {
  /**
   * `default` (centered, the whole modal scrolls), `fixed-footer` (70% tall,
   * the body scrolls and the footer stays pinned) or `bottom-sheet` (slides up
   * from the bottom edge, full width).
   */
  variant?: "default" | "fixed-footer" | "bottom-sheet" | null | undefined;
  /** Extra classes for the overlay behind the modal. */
  overlayClassName?: string;
  /** Portal container. Defaults to `document.body`. */
  container?: HTMLElement | null;
}

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/** Keep Tab inside `node` (used when the page is allowed to scroll, where Radix runs non-modal). */
function trapTab(event: React.KeyboardEvent<HTMLDivElement>): void {
  if (event.key !== "Tab") return;
  const node = event.currentTarget;
  const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0,
  );
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) {
    event.preventDefault();
    return;
  }
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === node)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/** The modal panel and its overlay, rendered in a portal. */
export function ModalContent({
  className,
  variant,
  overlayClassName,
  container,
  children,
  onEscapeKeyDown,
  onPointerDownOutside,
  onInteractOutside,
  onKeyDown,
  ...props
}: ModalContentProps): React.JSX.Element {
  const { open, dismissible, preventScrolling } = React.useContext(ModalContext);
  const block = (event: Event): void => {
    if (!dismissible) event.preventDefault();
  };
  // A toast action (e.g. "Undo") fired from inside the modal must not dismiss it.
  const blockOutside = (event: Event): void => {
    if (!dismissible || (event.target instanceof Element && event.target.closest('[data-slot="toaster"]'))) event.preventDefault();
  };

  return (
    <Dialog.Portal container={container}>
      {preventScrolling ? (
        <Dialog.Overlay
          data-slot="modal-overlay"
          className={cn(
            "fixed inset-0 z-50 bg-overlay data-[state=open]:animate-md-fade-in data-[state=closed]:animate-md-fade-out motion-reduce:animate-none!",
            overlayClassName,
          )}
        />
      ) : (
        <div
          data-slot="modal-overlay"
          data-state={open ? "open" : "closed"}
          aria-hidden="true"
          className={cn(
            "fixed inset-0 z-50 bg-overlay data-[state=open]:animate-md-fade-in data-[state=closed]:animate-md-fade-out motion-reduce:animate-none!",
            overlayClassName,
          )}
        />
      )}
      <Dialog.Content
        data-slot="modal"
        data-variant={variant ?? "default"}
        aria-modal={preventScrolling ? undefined : true}
        className={cn(modalContentVariants({ variant }), className)}
        onEscapeKeyDown={composeEventHandlers(onEscapeKeyDown, block)}
        onPointerDownOutside={composeEventHandlers(onPointerDownOutside, block)}
        onInteractOutside={composeEventHandlers(onInteractOutside, blockOutside)}
        onKeyDown={preventScrolling ? onKeyDown : composeEventHandlers(onKeyDown, trapTab)}
        {...props}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export type ModalHeaderProps = React.ComponentProps<"div">;

/** Groups the title and description at the top of the modal. */
export function ModalHeader({ className, ...props }: ModalHeaderProps): React.JSX.Element {
  return <div data-slot="modal-header" className={cn("flex shrink-0 flex-col gap-2 px-6 pt-6", className)} {...props} />;
}

export type ModalTitleProps = React.ComponentProps<typeof Dialog.Title>;

/** The modal's accessible name (`aria-labelledby`). */
export function ModalTitle({ className, ...props }: ModalTitleProps): React.JSX.Element {
  return (
    <Dialog.Title
      data-slot="modal-title"
      className={cn("text-[2rem] font-normal leading-[1.1] text-foreground", className)}
      {...props}
    />
  );
}

export type ModalDescriptionProps = React.ComponentProps<typeof Dialog.Description>;

/** Supporting text linked with `aria-describedby`. */
export function ModalDescription({ className, ...props }: ModalDescriptionProps): React.JSX.Element {
  return <Dialog.Description data-slot="modal-description" className={cn("text-muted-foreground", className)} {...props} />;
}

export type ModalBodyProps = React.ComponentProps<"div">;

/** Content area with Materialize's 24px padding. Scrolls inside `fixed-footer` modals. */
export function ModalBody({ className, ...props }: ModalBodyProps): React.JSX.Element {
  return (
    <div
      data-slot="modal-body"
      className={cn(
        "p-6 [[data-slot=modal-header]+&]:pt-4",
        "group-data-[variant=fixed-footer]/modal:min-h-0 group-data-[variant=fixed-footer]/modal:flex-1 group-data-[variant=fixed-footer]/modal:overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

export type ModalFooterProps = React.ComponentProps<"div">;

/** 56px action bar with right-aligned (flat) buttons. Pinned with a top border in `fixed-footer` modals. */
export function ModalFooter({ className, ...props }: ModalFooterProps): React.JSX.Element {
  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "flex h-14 w-full shrink-0 items-center justify-end gap-2 rounded-b-ui bg-surface-2 px-1.5 py-1 [&>[data-slot=button]]:my-1.5",
        "group-data-[variant=fixed-footer]/modal:border-t group-data-[variant=fixed-footer]/modal:border-border",
        "group-data-[variant=bottom-sheet]/modal:rounded-none",
        className,
      )}
      {...props}
    />
  );
}
