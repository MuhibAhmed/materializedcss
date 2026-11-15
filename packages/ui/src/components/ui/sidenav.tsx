"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Collapsible, Dialog, Slot } from "radix-ui";

import { useControllableState } from "@/hooks/use-controllable-state";
import { ExpandMoreIcon } from "@/components/ui/icons";
import { cn, composeEventHandlers, prefersReducedMotion } from "@/lib/utils";

/** Released past this fraction of the panel width, a drag opens (or closes) the sidenav. */
const DRAG_THRESHOLD = 0.2;
/** Released faster than this (px/ms), a drag counts as a fling. */
const FLING_VELOCITY = 0.3;
/** Movement before a pointer on the open panel is treated as a horizontal drag. */
const DRAG_SLOP = 10;
const SETTLE_MS = 250;

type SidenavEdge = "left" | "right";

interface SidenavContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  edge: SidenavEdge;
  draggable: boolean;
  /** True while a finger is moving the panel; disables the CSS keyframe animations. */
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
  /** Skip the slide-in keyframes (a drag already moved the panel into place). */
  skipEnter: boolean;
  /** Skip the slide-out keyframes (a drag already moved the panel off-screen). */
  skipExit: boolean;
  setSkipAnimations: (enter: boolean, exit: boolean) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  /** Progress (0 closed … 1 open) of a drag that began on the edge before the panel mounted. */
  pendingProgress: React.RefObject<number>;
}

const SidenavContext = React.createContext<SidenavContextValue | null>(null);

function useSidenav(component: string): SidenavContextValue {
  const context = React.useContext(SidenavContext);
  if (!context) throw new Error(`<${component}> must be used inside <Sidenav>`);
  return context;
}

/** Translate the panel to `progress` (0 = hidden, 1 = fully open) and fade the overlay with it. */
function paint(context: SidenavContextValue, progress: number, transition: boolean): void {
  const panel = context.contentRef.current;
  const overlay = context.overlayRef.current;
  const sign = context.edge === "left" ? -1 : 1;
  const duration = transition && !prefersReducedMotion() ? SETTLE_MS : 0;
  const easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  if (panel) {
    panel.style.transition = duration ? `transform ${duration}ms ${easing}` : "none";
    panel.style.transform = `translateX(${sign * (1 - progress) * 105}%)`;
  }
  if (overlay) {
    overlay.style.transition = duration ? `opacity ${duration}ms ${easing}` : "none";
    overlay.style.opacity = String(progress);
  }
}

function clearPaint(context: SidenavContextValue): void {
  for (const node of [context.contentRef.current, context.overlayRef.current]) {
    if (!node) continue;
    node.style.removeProperty("transition");
    node.style.removeProperty("transform");
    node.style.removeProperty("opacity");
  }
}

interface DragSession {
  startX: number;
  startY: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  width: number;
  /** Progress at the start of the drag (0 when opening from the edge, 1 when closing). */
  from: number;
  active: boolean;
}

/**
 * Pointer-driven drag shared by the edge target (opening) and the panel (closing).
 * Listeners live on `window` only for the duration of a drag and are always removed.
 */
function useDrag(context: SidenavContextValue, mode: "open" | "close"): (event: React.PointerEvent) => void {
  const cleanupRef = React.useRef<(() => void) | null>(null);
  React.useEffect(() => () => cleanupRef.current?.(), []);

  return React.useCallback(
    (event: React.PointerEvent) => {
      if (!context.draggable || event.button !== 0) return;
      if (mode === "close" && event.pointerType === "mouse") return;
      const sign = context.edge === "left" ? 1 : -1;
      const session: DragSession = {
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastTime: event.timeStamp,
        velocity: 0,
        width: context.contentRef.current?.offsetWidth ?? Math.min(300, window.innerWidth - 56),
        from: mode === "open" ? 0 : 1,
        active: false,
      };
      const pointerId = event.pointerId;

      const progressAt = (clientX: number): number => {
        const delta = ((clientX - session.startX) * sign) / session.width;
        return Math.min(1, Math.max(0, session.from + delta));
      };

      const onMove = (move: PointerEvent): void => {
        if (move.pointerId !== pointerId) return;
        if (!session.active) {
          const dx = Math.abs(move.clientX - session.startX);
          const dy = Math.abs(move.clientY - session.startY);
          if (dx < DRAG_SLOP && dy < DRAG_SLOP) return;
          if (dy > dx) {
            finish(false);
            return;
          }
          session.active = true;
          context.pendingProgress.current = progressAt(move.clientX);
          context.setDragging(true);
          if (mode === "open") {
            context.setSkipAnimations(true, false);
            context.setOpen(true);
          }
        }
        const dt = Math.max(1, move.timeStamp - session.lastTime);
        session.velocity = ((move.clientX - session.lastX) * sign) / dt;
        session.lastX = move.clientX;
        session.lastTime = move.timeStamp;
        const progress = progressAt(move.clientX);
        context.pendingProgress.current = progress;
        paint(context, progress, false);
      };

      const onUp = (up: PointerEvent): void => {
        if (up.pointerId !== pointerId) return;
        finish(true, up.clientX);
      };
      const onCancel = (cancel: PointerEvent): void => {
        if (cancel.pointerId !== pointerId) return;
        finish(true, session.lastX);
      };

      const detach = (): void => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
        cleanupRef.current = null;
      };

      function finish(settle: boolean, clientX?: number): void {
        detach();
        if (!settle || !session.active) return;
        const progress = progressAt(clientX ?? session.lastX);
        const moved = mode === "open" ? progress : 1 - progress;
        const flung = mode === "open" ? session.velocity > FLING_VELOCITY : session.velocity < -FLING_VELOCITY;
        const commit = moved >= DRAG_THRESHOLD || flung;
        const endOpen = mode === "open" ? commit : !commit;
        paint(context, endOpen ? 1 : 0, true);
        const done = (): void => {
          context.setDragging(false);
          if (endOpen) {
            context.setSkipAnimations(true, false);
            clearPaint(context);
          } else {
            context.setSkipAnimations(true, true);
            context.setOpen(false);
          }
        };
        if (prefersReducedMotion()) done();
        else window.setTimeout(done, SETTLE_MS);
      }

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
      cleanupRef.current = detach;
    },
    [context, mode],
  );
}

export interface SidenavProps {
  /** Controlled open state of the drawer. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the drawer opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Screen edge the drawer slides in from. */
  edge?: SidenavEdge;
  /**
   * Swipe from the screen edge to open and drag the panel to close (touch and pen).
   * Uses Pointer Events with `touch-action: pan-y`, so vertical scrolling still works.
   */
  draggable?: boolean;
  children?: React.ReactNode;
}

/**
 * Material side navigation (Materialize `.sidenav`). A modal drawer on Radix
 * Dialog with edge-swipe gestures, or a permanently visible desktop sidenav
 * with `<SidenavContent variant="fixed">`.
 */
export function Sidenav({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  edge = "left",
  draggable = true,
  children,
}: SidenavProps): React.JSX.Element {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [dragging, setDragging] = React.useState(false);
  const [skip, setSkip] = React.useState({ enter: false, exit: false });
  const setSkipAnimations = React.useCallback((enter: boolean, exit: boolean) => setSkip({ enter, exit }), []);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const pendingProgress = React.useRef(0);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setSkip({ enter: false, exit: false });
      setOpen(next);
    },
    [setOpen],
  );

  const value = React.useMemo<SidenavContextValue>(
    () => ({
      open,
      setOpen: handleOpenChange,
      edge,
      draggable,
      dragging,
      setDragging,
      skipEnter: skip.enter,
      skipExit: skip.exit,
      setSkipAnimations,
      contentRef,
      overlayRef,
      pendingProgress,
    }),
    [open, handleOpenChange, edge, draggable, dragging, skip, setSkipAnimations],
  );

  return (
    <SidenavContext.Provider value={value}>
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        {children}
      </Dialog.Root>
    </SidenavContext.Provider>
  );
}

export type SidenavTriggerProps = React.ComponentProps<typeof Dialog.Trigger>;

/** Opens the drawer (Materialize `.sidenav-trigger`). Use `asChild` to render your own button. */
export function SidenavTrigger(props: SidenavTriggerProps): React.JSX.Element {
  return <Dialog.Trigger data-slot="sidenav-trigger" {...props} />;
}

export type SidenavCloseProps = React.ComponentProps<typeof Dialog.Close>;

/** Closes the drawer (Materialize `.sidenav-close`). */
export function SidenavClose(props: SidenavCloseProps): React.JSX.Element {
  return <Dialog.Close data-slot="sidenav-close" {...props} />;
}

/** Invisible 10px strip on the screen edge that starts the open gesture. Rendered while closed. */
function SidenavDragTarget({ className }: { className?: string }): React.JSX.Element | null {
  const context = useSidenav("SidenavContent");
  const onPointerDown = useDrag(context, "open");
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted || !context.draggable || context.open) return null;
  return createPortal(
    <div
      data-slot="sidenav-drag-target"
      aria-hidden="true"
      onPointerDown={(event) => {
        if (event.pointerType === "mouse") return;
        onPointerDown(event);
      }}
      className={cn("fixed inset-y-0 z-40 w-2.5 touch-pan-y", context.edge === "left" ? "left-0" : "right-0", className)}
    />,
    document.body,
  );
}

const panelClasses =
  "flex flex-col overflow-y-auto overscroll-contain bg-surface text-foreground [&>nav>ul]:pb-4";

export interface SidenavContentProps extends Omit<React.ComponentProps<typeof Dialog.Content>, "title"> {
  /** Accessible name of the navigation (used for the dialog title and the `<nav>` landmark). */
  label?: string;
  /**
   * `modal` (default): an off-canvas drawer at every size. `fixed`: a static
   * `<nav>` from `breakpoint` up, and the modal drawer below it.
   */
  variant?: "modal" | "fixed";
  /** Where a `fixed` sidenav becomes permanently visible. */
  breakpoint?: "md" | "lg" | "xl";
  /** Close the drawer when a link inside it is clicked. */
  closeOnClick?: boolean;
  /** Extra classes for the overlay. */
  overlayClassName?: string;
  /** Portal container. Defaults to `document.body`. */
  container?: HTMLElement | null;
}

const fixedVisibility: Record<NonNullable<SidenavContentProps["breakpoint"]>, string> = {
  md: "hidden md:flex",
  lg: "hidden lg:flex",
  xl: "hidden xl:flex",
};

const fixedDrawerOnly: Record<NonNullable<SidenavContentProps["breakpoint"]>, string> = {
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
};

/** The navigation panel. Children are list items (`SidenavItem`, `SidenavSubheader`, ...). */
export function SidenavContent({
  className,
  label = "Navigation",
  variant = "modal",
  breakpoint = "lg",
  closeOnClick = false,
  overlayClassName,
  container,
  children,
  style,
  onClick,
  onPointerDown,
  ...props
}: SidenavContentProps): React.JSX.Element {
  const context = useSidenav("SidenavContent");
  const onDragClose = useDrag(context, "close");
  const { edge, dragging, skipEnter, skipExit, open, setOpen } = context;

  // A `fixed` sidenav closes its drawer once the static one becomes visible.
  React.useEffect(() => {
    if (variant !== "fixed" || !open) return;
    const query = { md: "(min-width: 48rem)", lg: "(min-width: 64rem)", xl: "(min-width: 80rem)" }[breakpoint];
    const mql = window.matchMedia(query);
    const check = (): void => {
      if (mql.matches) setOpen(false);
    };
    check();
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, [variant, breakpoint, open, setOpen]);

  // Apply the progress of an edge drag that started before the panel mounted.
  const setContentRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      context.contentRef.current = node;
      if (node && context.dragging) paint(context, context.pendingProgress.current, false);
    },
    [context],
  );
  const setOverlayRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      context.overlayRef.current = node;
      if (node && context.dragging) paint(context, context.pendingProgress.current, false);
    },
    [context],
  );

  const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (closeOnClick && event.target instanceof Element && event.target.closest("a[href]")) setOpen(false);
  };

  const list = (
    <nav aria-label={label}>
      <ul data-slot="sidenav-list" className="m-0 list-none! p-0!">{children}</ul>
    </nav>
  );

  const left = edge === "left";
  const animation = dragging
    ? "animate-none"
    : cn(
        skipEnter ? "data-[state=open]:animate-none" : left ? "data-[state=open]:animate-md-slide-in-left" : "data-[state=open]:animate-md-slide-in-right",
        skipExit ? "data-[state=closed]:animate-none" : left ? "data-[state=closed]:animate-md-slide-out-left" : "data-[state=closed]:animate-md-slide-out-right",
      );
  const overlayAnimation = dragging
    ? "animate-none"
    : cn(
        skipEnter ? "data-[state=open]:animate-none" : "data-[state=open]:animate-md-fade-in",
        skipExit ? "data-[state=closed]:animate-none" : "data-[state=closed]:animate-md-fade-out",
      );

  return (
    <>
      {variant === "fixed" ? (
        <div
          data-slot="sidenav"
          data-variant="fixed"
          className={cn(panelClasses, "h-full w-[300px] shrink-0 shadow-z1", fixedVisibility[breakpoint], className)}
          style={style}
        >
          {list}
        </div>
      ) : null}
      <SidenavDragTarget className={variant === "fixed" ? fixedDrawerOnly[breakpoint] : undefined} />
      <Dialog.Portal container={container}>
        <Dialog.Overlay
          ref={setOverlayRef}
          data-slot="sidenav-overlay"
          className={cn(
            "fixed inset-0 z-50 bg-overlay motion-reduce:animate-none!",
            overlayAnimation,
            overlayClassName,
          )}
        />
        <Dialog.Content
          ref={setContentRef}
          data-slot="sidenav"
          data-variant="modal"
          data-edge={edge}
          aria-describedby={undefined}
          className={cn(
            panelClasses,
            "fixed inset-y-0 z-50 w-[300px] max-w-[calc(100vw-56px)] touch-pan-y shadow-z3 outline-none motion-reduce:animate-none!",
            edge === "left" ? "left-0" : "right-0",
            animation,
            className,
          )}
          style={style}
          onPointerDown={composeEventHandlers(onPointerDown, onDragClose)}
          onClick={composeEventHandlers(onClick, handleClick)}
          {...props}
        >
          <Dialog.Title className="sr-only">{label}</Dialog.Title>
          {list}
        </Dialog.Content>
      </Dialog.Portal>
    </>
  );
}

export interface SidenavItemProps extends React.ComponentProps<"a"> {
  /** Render the child element (e.g. a router `Link` or a `<button>`) instead of an `<a>`. */
  asChild?: boolean;
  /** Mark the current page (`aria-current="page"` and a tinted background). */
  active?: boolean;
  /** Leading icon, tinted like Materialize (54% black). */
  icon?: React.ReactNode;
  /** Classes for the wrapping `<li>`. */
  itemClassName?: string;
}

/** A 48px navigation link. */
export function SidenavItem({
  asChild = false,
  active = false,
  icon,
  className,
  itemClassName,
  children,
  ...props
}: SidenavItemProps): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "a";
  return (
    <li data-slot="sidenav-item" className={itemClassName}>
      <Comp
        data-slot="sidenav-link"
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-12 w-full cursor-pointer items-center px-8 text-left text-sm font-medium text-foreground no-underline",
          "outline-none transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:focus-ring focus-visible:-outline-offset-2",
          active && "bg-surface-hover",
          "[&_svg]:size-6 [&_svg]:shrink-0 [&_.material-icons]:text-2xl",
          className,
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {icon ? (
              <span aria-hidden="true" className="mr-8 inline-flex size-6 shrink-0 items-center justify-center text-muted-foreground">
                {icon}
              </span>
            ) : null}
            {children}
          </>
        )}
      </Comp>
    </li>
  );
}

export type SidenavSubheaderProps = React.ComponentProps<"li">;

/** Non-interactive section label (Materialize `.subheader`). */
export function SidenavSubheader({ className, ...props }: SidenavSubheaderProps): React.JSX.Element {
  return (
    <li
      data-slot="sidenav-subheader"
      className={cn("flex h-12 items-center px-8 text-sm font-medium text-muted-foreground", className)}
      {...props}
    />
  );
}

export type SidenavDividerProps = React.ComponentProps<"li">;

/** 1px rule between groups of links. */
export function SidenavDivider({ className, ...props }: SidenavDividerProps): React.JSX.Element {
  return <li data-slot="sidenav-divider" aria-hidden="true" className={cn("mt-2 h-px bg-border", className)} {...props} />;
}

export interface SidenavUserViewProps extends React.ComponentProps<"li"> {
  /** Background: an image URL, or any node (e.g. an `<img>` or a gradient div). */
  background?: string | React.ReactNode;
  /** Avatar image URL (shown as a 64px circle) or a custom node. */
  avatar?: string | React.ReactNode;
  /** Alt text for a string `avatar`. */
  avatarAlt?: string;
  /** User name, shown in white. */
  name?: React.ReactNode;
  /** Email or secondary line, shown in white. */
  email?: React.ReactNode;
}

/** Header with a background image, avatar, name and email (Materialize `.user-view`). */
export function SidenavUserView({
  background,
  avatar,
  avatarAlt = "",
  name,
  email,
  className,
  children,
  ...props
}: SidenavUserViewProps): React.JSX.Element {
  return (
    <li
      data-slot="sidenav-user-view"
      className={cn("relative isolate mb-2 overflow-hidden bg-md-blue-grey-700 px-8 pt-8 text-white", className)}
      {...props}
    >
      {background ? (
        <div aria-hidden="true" className="absolute inset-0 -z-10 [&>img]:size-full [&>img]:object-cover">
          {typeof background === "string" ? <img src={background} alt="" className="size-full object-cover" /> : background}
        </div>
      ) : null}
      {avatar ? (
        typeof avatar === "string" ? (
          <img src={avatar} alt={avatarAlt} width={64} height={64} className="size-16 rounded-full object-cover" />
        ) : (
          <div className="size-16 overflow-hidden rounded-full">{avatar}</div>
        )
      ) : null}
      {name ? <span className="mt-4 block text-sm font-medium leading-6 [text-shadow:0_1px_2px_rgb(0_0_0/0.4)]">{name}</span> : null}
      {email ? <span className="block pb-4 text-sm leading-6 [text-shadow:0_1px_2px_rgb(0_0_0/0.4)]">{email}</span> : null}
      {children}
    </li>
  );
}

export interface SidenavCollapsibleProps extends Omit<React.ComponentProps<"li">, "title"> {
  /** Label of the disclosure button. */
  title: React.ReactNode;
  /** Leading icon of the disclosure button. */
  icon?: React.ReactNode;
  /** Controlled expanded state. */
  open?: boolean;
  /** Initial expanded state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the group expands or collapses. */
  onOpenChange?: (open: boolean) => void;
}

/** An expandable group of links inside the sidenav (simple disclosure). */
export function SidenavCollapsible({
  title,
  icon,
  open,
  defaultOpen,
  onOpenChange,
  className,
  children,
  ...props
}: SidenavCollapsibleProps): React.JSX.Element {
  return (
    <Collapsible.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} asChild>
      <li data-slot="sidenav-collapsible" className={cn("group/collapsible", className)} {...props}>
        <Collapsible.Trigger
          className={cn(
            "flex h-12 w-full cursor-pointer items-center px-8 text-left text-sm font-medium text-foreground",
            "outline-none transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:focus-ring focus-visible:-outline-offset-2",
          )}
        >
          {icon ? (
            <span aria-hidden="true" className="mr-8 inline-flex size-6 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-6">
              {icon}
            </span>
          ) : null}
          <span className="flex-1">{title}</span>
          <ExpandMoreIcon
            aria-hidden="true"
            className="size-6 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180"
          />
        </Collapsible.Trigger>
        <Collapsible.Content
          className={cn(
            "overflow-hidden [--radix-accordion-content-height:var(--radix-collapsible-content-height)]",
            "data-[state=open]:animate-md-accordion-down data-[state=closed]:animate-md-accordion-up motion-reduce:animate-none!",
          )}
        >
          <ul data-slot="sidenav-sublist" className="m-0 list-none! p-0! [&_[data-slot=sidenav-item]>*]:pl-14">{children}</ul>
        </Collapsible.Content>
      </li>
    </Collapsible.Root>
  );
}
