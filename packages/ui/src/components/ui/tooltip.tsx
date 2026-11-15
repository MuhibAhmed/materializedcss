"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import { useControllableState } from "@/hooks/use-controllable-state";
import { cn, composeEventHandlers } from "@/lib/utils";

/** Touch: hold this long to show a tooltip. */
const LONG_PRESS_MS = 500;
/** Touch: keep a long-press tooltip visible this long after the finger lifts. */
const TOUCH_HIDE_MS = 1500;

const ProviderContext = React.createContext(false);

export interface TooltipProviderProps {
  /** Default delay before tooltips open, in ms (Materialize `enterDelay`). */
  delayDuration?: number;
  /** Moving between triggers within this time opens the next tooltip instantly. */
  skipDelayDuration?: number;
  /** Close tooltips when the pointer leaves the trigger, even if it moves onto the tooltip. */
  disableHoverableContent?: boolean;
  children?: React.ReactNode;
}

/** Shares delay settings between tooltips. Optional: every `Tooltip` works without it. */
export function TooltipProvider({
  delayDuration = 0,
  skipDelayDuration = 300,
  disableHoverableContent,
  children,
}: TooltipProviderProps): React.JSX.Element {
  return (
    <ProviderContext.Provider value={true}>
      <TooltipPrimitive.Provider
        delayDuration={delayDuration}
        skipDelayDuration={skipDelayDuration}
        disableHoverableContent={disableHoverableContent}
      >
        {children}
      </TooltipPrimitive.Provider>
    </ProviderContext.Provider>
  );
}

interface TooltipRootContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Close right away on the next close request (Escape, click). */
  closeNow: () => void;
  cancelClose: () => void;
  scheduleClose: (delay: number) => void;
}

const TooltipRootContext = React.createContext<TooltipRootContextValue | null>(null);

export interface TooltipRootProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the tooltip opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Delay before the tooltip opens on hover, in ms (Materialize `enterDelay`). Defaults to the provider's (0). */
  enterDelay?: number;
  /** Delay before the tooltip closes after the pointer leaves, in ms (Materialize `exitDelay`). */
  exitDelay?: number;
  /** Close as soon as the pointer leaves the trigger instead of letting users hover the tooltip. */
  disableHoverableContent?: boolean;
  children?: React.ReactNode;
}

/** Composable tooltip root: pair it with `TooltipTrigger` and `TooltipContent`. */
export function TooltipRoot({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  enterDelay,
  exitDelay = 200,
  disableHoverableContent,
  children,
}: TooltipRootProps): React.JSX.Element {
  const hasProvider = React.useContext(ProviderContext);
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const timer = React.useRef<number | undefined>(undefined);
  const immediate = React.useRef(false);

  const cancelClose = React.useCallback(() => window.clearTimeout(timer.current), []);
  const scheduleClose = React.useCallback(
    (delay: number) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setOpen(false), delay);
    },
    [setOpen],
  );
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      window.clearTimeout(timer.current);
      if (next) setOpen(true);
      else if (immediate.current || exitDelay <= 0) setOpen(false);
      else scheduleClose(exitDelay);
      immediate.current = false;
    },
    [exitDelay, scheduleClose, setOpen],
  );

  const value = React.useMemo<TooltipRootContextValue>(
    () => ({
      open,
      setOpen,
      closeNow: () => {
        immediate.current = true;
      },
      cancelClose,
      scheduleClose,
    }),
    [open, setOpen, cancelClose, scheduleClose],
  );

  const root = (
    <TooltipRootContext.Provider value={value}>
      <TooltipPrimitive.Root
        open={open}
        onOpenChange={handleOpenChange}
        delayDuration={enterDelay}
        disableHoverableContent={disableHoverableContent}
      >
        {children}
      </TooltipPrimitive.Root>
    </TooltipRootContext.Provider>
  );

  return hasProvider ? root : <TooltipProvider>{root}</TooltipProvider>;
}

function useTooltipRoot(component: string): TooltipRootContextValue {
  const context = React.useContext(TooltipRootContext);
  if (!context) throw new Error(`<${component}> must be used inside <TooltipRoot> or <Tooltip>`);
  return context;
}

export type TooltipTriggerProps = React.ComponentProps<typeof TooltipPrimitive.Trigger>;

/**
 * The element the tooltip describes (`aria-describedby`). Opens on hover, on
 * keyboard focus and on a touch long-press. Use `asChild` to keep your element.
 */
export function TooltipTrigger({
  onPointerEnter,
  onFocus,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onClick,
  onContextMenu,
  ...props
}: TooltipTriggerProps): React.JSX.Element {
  const context = useTooltipRoot("TooltipTrigger");
  const pressTimer = React.useRef<number | undefined>(undefined);
  const pressed = React.useRef(false);
  React.useEffect(() => () => window.clearTimeout(pressTimer.current), []);

  const endPress = (): void => {
    window.clearTimeout(pressTimer.current);
    if (pressed.current) context.scheduleClose(TOUCH_HIDE_MS);
  };

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      onPointerEnter={composeEventHandlers(onPointerEnter, context.cancelClose)}
      onFocus={composeEventHandlers(onFocus, context.cancelClose)}
      onPointerDown={composeEventHandlers(onPointerDown, (event: React.PointerEvent<HTMLButtonElement>) => {
        pressed.current = false;
        if (event.pointerType === "touch") {
          window.clearTimeout(pressTimer.current);
          pressTimer.current = window.setTimeout(() => {
            pressed.current = true;
            context.cancelClose();
            context.setOpen(true);
          }, LONG_PRESS_MS);
        } else {
          context.closeNow();
        }
      })}
      onPointerUp={composeEventHandlers(onPointerUp, endPress)}
      onPointerCancel={composeEventHandlers(onPointerCancel, endPress)}
      onClick={composeEventHandlers(onClick, (event: React.MouseEvent<HTMLButtonElement>) => {
        // Radix closes on click; keep a long-press tooltip visible until its timer ends.
        if (pressed.current) event.preventDefault();
      })}
      onContextMenu={composeEventHandlers(onContextMenu, (event: React.MouseEvent<HTMLButtonElement>) => {
        if (pressed.current) event.preventDefault();
      })}
      {...props}
    />
  );
}

export interface TooltipContentProps extends React.ComponentProps<typeof TooltipPrimitive.Content> {
  /** Portal container. Defaults to `document.body`. */
  container?: HTMLElement | null;
}

/**
 * The tooltip bubble. Slides 10px toward its side while fading in (250ms) and
 * fades out in 200ms; flips and shifts to stay inside the viewport.
 */
export function TooltipContent({
  className,
  side = "bottom",
  sideOffset = 5,
  collisionPadding = 8,
  container,
  onEscapeKeyDown,
  onPointerEnter,
  ...props
}: TooltipContentProps): React.JSX.Element {
  const context = useTooltipRoot("TooltipContent");
  return (
    <TooltipPrimitive.Portal container={container}>
      <TooltipPrimitive.Content
        data-slot="tooltip"
        side={side}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        onEscapeKeyDown={composeEventHandlers(onEscapeKeyDown, context.closeNow)}
        onPointerEnter={composeEventHandlers(onPointerEnter, context.cancelClose)}
        className={cn(
          "z-[2000] flex min-h-9 max-w-[min(20rem,var(--radix-tooltip-content-available-width))] items-center justify-center rounded-ui bg-snackbar px-2 py-2.5 text-center text-base leading-[1.2] text-snackbar-foreground",
          "origin-[var(--radix-tooltip-content-transform-origin)] transition-[opacity,translate] duration-250 ease-out-cubic starting:opacity-0",
          "data-[side=bottom]:starting:-translate-y-2.5 data-[side=top]:starting:translate-y-2.5 data-[side=left]:starting:translate-x-2.5 data-[side=right]:starting:-translate-x-2.5",
          "data-[state=closed]:animate-[md-fade-out_200ms_cubic-bezier(0.215,0.61,0.355,1)_both]",
          "motion-reduce:transition-none motion-reduce:animate-none!",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

export interface TooltipProps extends TooltipRootProps {
  /** Tooltip text or any React node. Never parsed as HTML (fixes Materialize's XSS, CVE-2019-11002). */
  content: React.ReactNode;
  /** Placement (Materialize `position`). */
  side?: "top" | "right" | "bottom" | "left";
  /** Alignment along the side. */
  align?: "start" | "center" | "end";
  /** Distance from the trigger in px (Materialize `margin`). */
  sideOffset?: number;
  /** Classes for the tooltip bubble. */
  contentClassName?: string;
  /** The trigger. Must be a single element that accepts a ref and event handlers. */
  children: React.ReactElement;
}

/**
 * Material tooltip with a one-line API:
 * `<Tooltip content="Save"><Button>…</Button></Tooltip>`.
 */
export function Tooltip({
  content,
  side,
  align,
  sideOffset,
  contentClassName,
  children,
  ...rootProps
}: TooltipProps): React.JSX.Element {
  if (content === null || content === undefined || content === false || content === "") return children;
  return (
    <TooltipRoot {...rootProps}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align} sideOffset={sideOffset} className={contentClassName}>
        {content}
      </TooltipContent>
    </TooltipRoot>
  );
}
