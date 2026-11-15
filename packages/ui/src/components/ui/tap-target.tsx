"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Slot } from "radix-ui";

import { useControllableState } from "@/hooks/use-controllable-state";
import { cn, prefersReducedMotion } from "@/lib/utils";

const TRANSITION_MS = 300;
/** Keep the text this far from the viewport edges. */
const VIEWPORT_MARGIN = 16;

interface TapTargetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  titleId: string;
  descriptionId: string;
}

const TapTargetContext = React.createContext<TapTargetContextValue | null>(null);

function useTapTarget(component: string): TapTargetContextValue {
  const context = React.useContext(TapTargetContext);
  if (!context) throw new Error(`<${component}> must be used inside <TapTarget>`);
  return context;
}

export interface TapTargetProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the tap target opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** The highlighted element, when you don't wrap it in `TapTargetAnchor`. */
  targetRef?: React.RefObject<HTMLElement | null>;
  children?: React.ReactNode;
}

/**
 * Material feature discovery (Materialize TapTarget): a large primary circle
 * expands around a target element with a title and description. Escape or a
 * click outside closes it; focus moves to the text and back again.
 */
export function TapTarget({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  targetRef,
  children,
}: TapTargetProps): React.JSX.Element {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const ownRef = React.useRef<HTMLElement | null>(null);
  const id = React.useId();
  const value = React.useMemo<TapTargetContextValue>(
    () => ({
      open,
      setOpen,
      anchorRef: targetRef ?? ownRef,
      titleId: `${id}-title`,
      descriptionId: `${id}-description`,
    }),
    [open, setOpen, targetRef, id],
  );
  return <TapTargetContext.Provider value={value}>{children}</TapTargetContext.Provider>;
}

export interface TapTargetAnchorProps extends React.HTMLAttributes<HTMLElement> {
  /** A single element: the feature being introduced. */
  children: React.ReactElement;
}

/** Marks its child as the element the tap target highlights. Renders no wrapper. */
export function TapTargetAnchor(props: TapTargetAnchorProps): React.JSX.Element {
  const context = useTapTarget("TapTargetAnchor");
  return <Slot.Root data-slot="tap-target-anchor" ref={context.anchorRef as React.Ref<HTMLElement>} {...props} />;
}

interface Layout {
  size: number;
  left: number;
  top: number;
  text: { left: number; top: number; width: number; height: number; padding: number; alignBottom: boolean; alignRight: boolean };
  wave: { left: number; top: number; size: number };
  origin: { width: number; height: number };
}

/** Materialize's quadrant logic: the text goes in the quarter of the circle that faces the middle of the screen. */
function computeLayout(rect: DOMRect, size: number): Layout {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const isLeft = cx <= vw / 2;
  const isTop = cy <= vh / 2;
  const isCenteringX = cx >= vw * 0.25 && cx <= vw * 0.75;
  const left = cx - size / 2;
  const top = cy - size / 2;
  const originWidth = rect.width;

  let textLeft = isCenteringX ? 0 : isLeft ? size / 2 - originWidth : 0;
  let textWidth = isCenteringX ? size : size / 2 + originWidth;
  let textTop = isTop ? size / 2 : 0;
  let textHeight = size / 2;

  // Improvement: keep the text box inside the viewport (Materialize let it run off small screens).
  const minX = VIEWPORT_MARGIN - left;
  const maxX = vw - VIEWPORT_MARGIN - left;
  const clampedLeft = Math.max(textLeft, minX);
  textWidth = Math.min(textLeft + textWidth, maxX) - clampedLeft;
  textLeft = clampedLeft;
  const minY = VIEWPORT_MARGIN - top;
  const maxY = vh - VIEWPORT_MARGIN - top;
  const clampedTop = Math.max(textTop, minY);
  textHeight = Math.min(textTop + textHeight, maxY) - clampedTop;
  textTop = clampedTop;

  const waveSize = Math.max(rect.width, rect.height) * 2;
  return {
    size,
    left,
    top,
    text: {
      left: textLeft,
      top: textTop,
      width: Math.max(0, textWidth),
      height: Math.max(0, textHeight),
      padding: Math.min(originWidth, 56),
      alignBottom: !isTop,
      alignRight: !isLeft && !isCenteringX,
    },
    wave: { left: size / 2 - waveSize / 2, top: size / 2 - waveSize / 2, size: waveSize },
    origin: { width: rect.width, height: rect.height },
  };
}

export interface TapTargetContentProps extends React.ComponentProps<"div"> {
  /** Diameter of the circle in px (Materialize uses 800). */
  size?: number;
  /** Classes for the colored circle (e.g. `bg-secondary`). */
  circleClassName?: string;
}

/** The expanding circle and its text. Put `TapTargetTitle` and `TapTargetDescription` inside. */
export function TapTargetContent({
  size = 800,
  className,
  circleClassName,
  children,
  ...props
}: TapTargetContentProps): React.JSX.Element | null {
  const { open, setOpen, anchorRef, titleId, descriptionId } = useTapTarget("TapTargetContent");
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [layout, setLayout] = React.useState<Layout | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const originRef = React.useRef<HTMLDivElement | null>(null);
  const returnFocus = React.useRef<HTMLElement | null>(null);

  const update = React.useCallback(() => {
    const anchor = anchorRef.current;
    if (anchor) setLayout(computeLayout(anchor.getBoundingClientRect(), size));
  }, [anchorRef, size]);

  // Mount, then flip to the visible state on the next frame so the CSS transitions run.
  React.useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      update();
      setMounted(true);
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), prefersReducedMotion() ? 0 : TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [open, update]);

  // Focus management: move into the content, restore on close.
  React.useEffect(() => {
    if (!mounted) return;
    contentRef.current?.focus({ preventScroll: true });
    return () => {
      const target = returnFocus.current ?? anchorRef.current;
      if (target?.isConnected) target.focus({ preventScroll: true });
    };
  }, [mounted, anchorRef]);

  // Escape, outside clicks and layout updates while open.
  React.useEffect(() => {
    if (!open) return;
    let frame = 0;
    const onFrame = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent): void => {
      const node = contentRef.current;
      if (node && event.target instanceof Node && node.contains(event.target)) return;
      setOpen(false);
    };
    window.addEventListener("resize", onFrame);
    window.addEventListener("scroll", onFrame, true);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onFrame);
      window.removeEventListener("scroll", onFrame, true);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, setOpen, update]);

  // Show a non-interactive copy of the target inside the white wave (Materialize `.tap-target-origin`).
  React.useEffect(() => {
    const host = originRef.current;
    const anchor = anchorRef.current;
    if (!mounted || !host || !anchor) return;
    const clone = anchor.cloneNode(true) as HTMLElement;
    clone.removeAttribute("id");
    clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    clone.setAttribute("tabindex", "-1");
    clone.style.margin = "0";
    clone.style.pointerEvents = "none";
    clone.style.position = "static";
    clone.style.transform = "none";
    host.replaceChildren(clone);
    return () => host.replaceChildren();
  }, [mounted, anchorRef]);

  if (!mounted || !layout) return null;
  const state = visible ? "open" : "closed";
  const transition = "transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.42,0,0.58,1)] motion-reduce:transition-none";

  return createPortal(
    <div
      ref={contentRef}
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabIndex={-1}
      data-slot="tap-target"
      data-state={state}
      className={cn("pointer-events-none fixed z-[1000] outline-none", className)}
      style={{ left: layout.left, top: layout.top, width: layout.size, height: layout.size }}
      {...props}
    >
      <div
        data-slot="tap-target-circle"
        className={cn(
          "pointer-events-auto absolute inset-0 scale-0 rounded-full bg-primary opacity-0 shadow-z2",
          "data-[state=open]:scale-100 data-[state=open]:opacity-100",
          transition,
          circleClassName,
        )}
        data-state={state}
      />
      <div
        data-slot="tap-target-content"
        data-state={state}
        className={cn(
          "absolute flex flex-col text-primary-foreground opacity-0 data-[state=open]:opacity-100",
          layout.text.alignBottom ? "justify-end" : "justify-start",
          layout.text.alignRight ? "text-right" : "text-left",
          "transition-opacity duration-300 motion-reduce:transition-none",
        )}
        style={{
          left: layout.text.left,
          top: layout.text.top,
          width: layout.text.width,
          height: layout.text.height,
          padding: layout.text.padding,
        }}
      >
        <div className="pointer-events-auto">{children}</div>
      </div>
      <div
        data-slot="tap-target-wave"
        className="absolute"
        style={{ left: layout.wave.left, top: layout.wave.top, width: layout.wave.size, height: layout.wave.size }}
      >
        <span
          aria-hidden="true"
          data-state={state}
          className={cn("absolute inset-0 scale-0 rounded-full bg-white data-[state=open]:scale-100", transition)}
        />
        {visible ? (
          <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/80 animate-md-pulse motion-reduce:hidden" />
        ) : null}
        <div
          ref={originRef}
          aria-hidden="true"
          data-slot="tap-target-origin"
          onClick={() => setOpen(false)}
          className="pointer-events-auto absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center"
          style={{ width: layout.origin.width, height: layout.origin.height }}
        />
      </div>
    </div>,
    document.body,
  );
}

export type TapTargetTitleProps = React.ComponentProps<"h2">;

/** Heading that names the dialog. */
export function TapTargetTitle({ className, ...props }: TapTargetTitleProps): React.JSX.Element {
  const { titleId } = useTapTarget("TapTargetTitle");
  return <h2 id={titleId} data-slot="tap-target-title" className={cn("mb-2 text-h5 font-normal", className)} {...props} />;
}

export type TapTargetDescriptionProps = React.ComponentProps<"p">;

/** Supporting text that describes the feature. */
export function TapTargetDescription({ className, ...props }: TapTargetDescriptionProps): React.JSX.Element {
  const { descriptionId } = useTapTarget("TapTargetDescription");
  return <p id={descriptionId} data-slot="tap-target-description" className={cn("text-base leading-relaxed", className)} {...props} />;
}
