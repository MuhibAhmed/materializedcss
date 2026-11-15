"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cva } from "class-variance-authority";

import { CloseIcon } from "@/components/ui/icons";
import { cn, composeEventHandlers, prefersReducedMotion } from "@/lib/utils";

/* -------------------------------------------------------------------------------------------------
 * Store
 * -----------------------------------------------------------------------------------------------*/

export interface ToastActionOptions {
  /** Button text, e.g. "Undo". */
  label: React.ReactNode;
  /** Runs on click. The toast is dismissed afterwards unless the handler calls `event.preventDefault()`. */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Accessible name when `label` is not plain text. */
  altText?: string;
}

export interface ToastOptions {
  /** Reuse an id to update a toast that is already showing. */
  id?: string;
  /** Message. A React node, never parsed as HTML (fixes Materialize's XSS, CVE-2019-11004). */
  content: React.ReactNode;
  /** Optional action button, shown in the snackbar accent color. */
  action?: ToastActionOptions;
  /** Time in ms before the toast hides (Materialize `displayLength`). `Infinity` keeps it until dismissed. */
  duration?: number;
  /** Extra classes for the toast (Materialize `classes`). */
  classes?: string;
  /** Alias of `classes`. */
  className?: string;
  /** `rounded` uses a 24px pill radius (Materialize `.rounded`). */
  variant?: "default" | "rounded";
  /** `error` toasts are announced assertively; others politely. */
  type?: "default" | "error";
  /** Show a close (×) button. Defaults to the `Toaster` setting. */
  closeButton?: boolean;
  /** Called after the toast has been removed (Materialize `completeCallback`). */
  onDismiss?: (id: string) => void;
}

interface ToastRecord extends ToastOptions {
  id: string;
  closing: boolean;
}

type Listener = () => void;

let toasts: readonly ToastRecord[] = [];
const listeners = new Set<Listener>();
let counter = 0;
const EMPTY: readonly ToastRecord[] = [];

function emit(next: readonly ToastRecord[]): void {
  toasts = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isOptions(input: unknown): input is ToastOptions {
  return typeof input === "object" && input !== null && !React.isValidElement(input) && !Array.isArray(input) && "content" in input;
}

function removeToast(id: string): void {
  const record = toasts.find((entry) => entry.id === id);
  if (!record) return;
  emit(toasts.filter((entry) => entry.id !== id));
  record.onDismiss?.(id);
}

/** Show a toast. Returns its id. Accepts a message or an options object. */
function showToast(input: React.ReactNode | ToastOptions): string {
  const options: ToastOptions = isOptions(input) ? input : { content: input };
  const id = options.id ?? `toast-${++counter}`;
  const record: ToastRecord = { ...options, id, closing: false };
  const existing = toasts.findIndex((entry) => entry.id === id);
  if (existing === -1) emit([...toasts, record]);
  else emit(toasts.map((entry, index) => (index === existing ? record : entry)));
  return id;
}

/** Hide one toast with its exit animation. */
function dismissToast(id: string): void {
  emit(toasts.map((entry) => (entry.id === id && !entry.closing ? { ...entry, closing: true } : entry)));
}

/** Hide every toast (Materialize `M.Toast.dismissAll()`). */
function dismissAllToasts(): void {
  emit(toasts.map((entry) => (entry.closing ? entry : { ...entry, closing: true })));
}

export interface ToastFunction {
  (input: React.ReactNode | ToastOptions): string;
  /** Hide one toast by id. */
  dismiss: (id: string) => void;
  /** Hide every toast. */
  dismissAll: () => void;
}

/**
 * Imperative API: `toast("Saved")` or `toast({ content, action, duration })`.
 * Requires a mounted `<Toaster />`.
 */
export const toast: ToastFunction = Object.assign(showToast, {
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
});

/** Subscribe to the current toasts (for custom toasters). */
export function useToasts(): readonly ToastRecord[] {
  return React.useSyncExternalStore(subscribe, () => toasts, () => EMPTY);
}

/* Only the first mounted Toaster renders, so adding one per page section never duplicates toasts. */
const toasters: string[] = [];
const toasterListeners = new Set<Listener>();
function subscribeToasters(listener: Listener): () => void {
  toasterListeners.add(listener);
  return () => toasterListeners.delete(listener);
}
function notifyToasters(): void {
  for (const listener of toasterListeners) listener();
}

/* -------------------------------------------------------------------------------------------------
 * Presentational toast
 * -----------------------------------------------------------------------------------------------*/

export const toastVariants = cva(
  [
    "pointer-events-auto relative mt-2.5 flex min-h-12 w-full max-w-full cursor-default touch-pan-y select-none items-center justify-between",
    "bg-snackbar px-[25px] py-2.5 text-[1.1rem] font-light leading-[1.5em] text-snackbar-foreground shadow-z1",
    "min-[601px]:w-auto",
  ],
  {
    variants: {
      variant: {
        default: "rounded-none min-[601px]:rounded-ui",
        rounded: "rounded-[24px]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface ToastProps extends React.ComponentProps<"div"> {
  /** `rounded` uses a 24px pill radius. */
  variant?: "default" | "rounded" | null | undefined;
}

/** The snackbar surface. Rendered for you by `Toaster`; export it for static layouts. */
export function Toast({ className, variant, ...props }: ToastProps): React.JSX.Element {
  return <div data-slot="toast" className={cn(toastVariants({ variant }), className)} {...props} />;
}

export type ToastActionProps = React.ComponentProps<"button">;

/** Uppercase action button in the snackbar accent color (Materialize `.toast-action`). */
export function ToastAction({ className, type = "button", ...props }: ToastActionProps): React.JSX.Element {
  return (
    <button
      data-slot="toast-action"
      type={type}
      className={cn(
        "-my-1 -mr-3 ml-12 shrink-0 cursor-pointer rounded-ui px-3 py-1.5 text-[0.95rem] font-medium uppercase tracking-[0.5px] text-snackbar-action",
        "outline-none transition-colors hover:bg-white/10 focus-visible:focus-ring dark:hover:bg-black/5",
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Toaster
 * -----------------------------------------------------------------------------------------------*/

/** Swipe further than this fraction of the width to dismiss (Materialize `activationPercent`). */
const SWIPE_ACTIVATION = 0.8;
/** Or fling faster than this, in px/ms. */
const SWIPE_VELOCITY = 1;

interface ToastItemProps {
  record: ToastRecord;
  paused: boolean;
  defaultDuration: number;
  defaultCloseButton: boolean;
  onMounted: (node: HTMLDivElement, record: ToastRecord) => void;
}

function ToastItem({ record, paused, defaultDuration, defaultCloseButton, onMounted }: ToastItemProps): React.JSX.Element {
  const { id, closing, content, action, variant, classes, className } = record;
  const duration = record.duration ?? defaultDuration;
  const closeButton = record.closeButton ?? defaultCloseButton;
  const ref = React.useRef<HTMLDivElement | null>(null);
  const remaining = React.useRef(duration);
  const drag = React.useRef<{ x: number; time: number; dx: number; pointerId: number } | null>(null);
  const announced = React.useRef(false);

  React.useEffect(() => {
    remaining.current = duration;
  }, [duration, content]);

  React.useEffect(() => {
    if (announced.current || !ref.current) return;
    announced.current = true;
    onMounted(ref.current, record);
  }, [onMounted, record]);

  // Auto-dismiss timer, paused on hover/focus/window blur.
  React.useEffect(() => {
    if (paused || closing || !Number.isFinite(duration)) return;
    const started = Date.now();
    const timer = window.setTimeout(() => dismissToast(id), Math.max(0, remaining.current));
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
  }, [paused, closing, duration, id]);

  // Exit animation, then removal.
  React.useEffect(() => {
    const node = ref.current;
    if (!closing || !node) return;
    if (prefersReducedMotion() || getComputedStyle(node).animationName === "none") {
      removeToast(id);
      return;
    }
    const onEnd = (event: AnimationEvent): void => {
      if (event.target === node) removeToast(id);
    };
    node.addEventListener("animationend", onEnd);
    const fallback = window.setTimeout(() => removeToast(id), 600);
    return () => {
      node.removeEventListener("animationend", onEnd);
      window.clearTimeout(fallback);
    };
  }, [closing, id]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0 || closing) return;
    if (event.target instanceof Element && event.target.closest("button, a, input, select, textarea")) return;
    drag.current = { x: event.clientX, time: event.timeStamp, dx: 0, pointerId: event.pointerId };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic or already-released pointers cannot be captured; dragging still works.
    }
    event.currentTarget.style.transition = "none";
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    const state = drag.current;
    if (!state || event.pointerId !== state.pointerId) return;
    const node = event.currentTarget;
    state.dx = event.clientX - state.x;
    const activation = node.offsetWidth * SWIPE_ACTIVATION;
    node.style.transform = `translateX(${state.dx}px)`;
    node.style.opacity = String(Math.max(0, 1 - Math.abs(state.dx) / activation));
  };

  const onPointerEnd = (event: React.PointerEvent<HTMLDivElement>): void => {
    const state = drag.current;
    if (!state || event.pointerId !== state.pointerId) return;
    drag.current = null;
    const node = event.currentTarget;
    const width = node.offsetWidth;
    const velocity = Math.abs(state.dx) / Math.max(1, event.timeStamp - state.time);
    const swiped =
      event.type === "pointerup" &&
      (Math.abs(state.dx) > width * SWIPE_ACTIVATION || (velocity > SWIPE_VELOCITY && Math.abs(state.dx) > width * 0.1));
    if (swiped) {
      const reduce = prefersReducedMotion();
      node.style.transition = reduce ? "none" : "transform 150ms ease-out, opacity 150ms ease-out";
      node.style.transform = `translateX(${Math.sign(state.dx) * width}px)`;
      node.style.opacity = "0";
      if (reduce) removeToast(id);
      else window.setTimeout(() => removeToast(id), 150);
    } else {
      node.style.transition = "transform 200ms ease-out, opacity 200ms ease-out";
      node.style.transform = "";
      node.style.opacity = "";
    }
  };

  return (
    <Toast
      ref={ref}
      data-state={closing ? "closed" : "open"}
      variant={variant}
      className={cn(
        "data-[state=open]:animate-md-toast-in data-[state=closed]:animate-md-toast-out motion-reduce:animate-none!",
        classes,
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          dismissToast(id);
        }
      }}
    >
      <div className="min-w-0 flex-1 py-1">{content}</div>
      {action ? (
        <ToastAction
          aria-label={action.altText}
          onClick={composeEventHandlers(action.onClick, () => dismissToast(id))}
        >
          {action.label}
        </ToastAction>
      ) : null}
      {closeButton ? (
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => dismissToast(id)}
          className="-mr-3 ml-3 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-snackbar-foreground/70 outline-none transition-colors hover:bg-white/10 hover:text-snackbar-foreground focus-visible:focus-ring dark:hover:bg-black/5"
        >
          <CloseIcon className="size-5" />
        </button>
      ) : null}
    </Toast>
  );
}

export interface ToasterProps {
  /** How many toasts are visible at once. Extra toasts wait in a queue. */
  max?: number;
  /** Default display time in ms (Materialize `displayLength`). */
  duration?: number;
  /** Show a close button on every toast. */
  closeButton?: boolean;
  /** Accessible name of the notifications region. */
  label?: string;
  /** Classes for the fixed container. */
  className?: string;
}

/**
 * Renders toasts created with `toast()`. Mount it once (e.g. in your root layout).
 * Placement follows Materialize: top-right on large screens, bottom-left on
 * medium and full-width at the bottom on small screens.
 */
export function Toaster({
  max = 3,
  duration = 4000,
  closeButton = false,
  label = "Notifications",
  className,
}: ToasterProps): React.JSX.Element | null {
  const all = useToasts();
  const instanceId = React.useId();
  const activeToaster = React.useSyncExternalStore(
    subscribeToasters,
    () => toasters[0],
    () => undefined,
  );
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [windowBlurred, setWindowBlurred] = React.useState(false);
  const [polite, setPolite] = React.useState("");
  const [assertive, setAssertive] = React.useState("");
  const announceTimer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    toasters.push(instanceId);
    notifyToasters();
    return () => {
      toasters.splice(toasters.indexOf(instanceId), 1);
      notifyToasters();
    };
  }, [instanceId]);

  React.useEffect(() => {
    const onBlur = (): void => setWindowBlurred(true);
    const onFocus = (): void => setWindowBlurred(false);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.clearTimeout(announceTimer.current);
    };
  }, []);

  const visible = all.slice(0, Math.max(1, max));
  React.useEffect(() => {
    if (visible.length === 0) {
      setHovered(false);
      setFocused(false);
    }
  }, [visible.length]);

  // Announce through live regions that exist before the toast does, so screen readers always read it.
  const onMounted = React.useCallback((node: HTMLDivElement, record: ToastRecord) => {
    const text = node.textContent ?? "";
    const set = record.type === "error" ? setAssertive : setPolite;
    set("");
    window.clearTimeout(announceTimer.current);
    announceTimer.current = window.setTimeout(() => set(text), 100);
  }, []);

  if (activeToaster !== instanceId) return null;

  return createPortal(
    <section aria-label={label} data-slot="toaster">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {polite}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertive}
      </div>
      <div
        className={cn(
          "pointer-events-none fixed bottom-0 left-0 z-[10000] flex w-full flex-col",
          "min-[601px]:bottom-[7%] min-[601px]:left-[5%] min-[601px]:w-auto min-[601px]:max-w-[90%] min-[601px]:items-start",
          "min-[993px]:bottom-auto min-[993px]:left-auto min-[993px]:right-[7%] min-[993px]:top-[10%] min-[993px]:max-w-[86%] min-[993px]:items-end",
          className,
        )}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        {visible.map((record) => (
          <ToastItem
            key={record.id}
            record={record}
            paused={hovered || focused || windowBlurred}
            defaultDuration={duration}
            defaultCloseButton={closeButton}
            onMounted={onMounted}
          />
        ))}
      </div>
    </section>,
    document.body,
  );
}
