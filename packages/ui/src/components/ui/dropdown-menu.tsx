"use client";

import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";

import { useControllableState } from "@/hooks/use-controllable-state";
import { CheckIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn, composeEventHandlers } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  hover: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  /** True between a pointer press on the trigger and its release. */
  pressingTrigger: React.RefObject<boolean>;
  /** Start the open delay (hover mode). */
  scheduleOpen: () => void;
  /** Start the close delay (hover mode). */
  scheduleClose: () => void;
  cancelTimers: () => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(): DropdownMenuContextValue {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenu parts must be used inside <DropdownMenu>");
  return context;
}

export interface DropdownMenuProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Open when the pointer rests on the trigger and close shortly after it leaves
   * (Materialize `hover: true`). Keyboard and touch still open it on activation.
   */
  hover?: boolean;
  /** Delay before a hover opens the menu, in ms. */
  openDelay?: number;
  /** Delay before leaving the trigger and menu closes it, in ms. */
  closeDelay?: number;
  /** Modal menus block outside interaction while open. Hover menus are never modal. */
  modal?: boolean;
  /** Reading direction for submenus and keyboard navigation. */
  dir?: "ltr" | "rtl";
  children?: React.ReactNode;
}

/**
 * Material dropdown menu (Materialize `.dropdown-content`). Built on Radix
 * DropdownMenu: keyboard navigation, type-ahead, submenus, checkbox and radio
 * items, and collision-aware positioning in a portal, so menus are never clipped
 * by `overflow: hidden` ancestors or pushed off-screen.
 */
export function DropdownMenu({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  hover = false,
  openDelay = 100,
  closeDelay = 225,
  modal = true,
  dir,
  children,
}: DropdownMenuProps): React.JSX.Element {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const pressingTrigger = React.useRef(false);
  const timer = React.useRef<number | undefined>(undefined);

  const cancelTimers = React.useCallback(() => window.clearTimeout(timer.current), []);
  const scheduleOpen = React.useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), openDelay);
  }, [openDelay, setOpen]);
  const scheduleClose = React.useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), closeDelay);
  }, [closeDelay, setOpen]);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = React.useMemo(
    () => ({ open, hover, setOpen, triggerRef, pressingTrigger, scheduleOpen, scheduleClose, cancelTimers }),
    [open, hover, setOpen, scheduleOpen, scheduleClose, cancelTimers],
  );

  return (
    <DropdownMenuContext.Provider value={value}>
      <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen} modal={hover ? false : modal} dir={dir}>
        {children}
      </DropdownMenuPrimitive.Root>
    </DropdownMenuContext.Provider>
  );
}

export type DropdownMenuTriggerProps = React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>;

/** The element that toggles the menu (Materialize `.dropdown-trigger`). Use `asChild` for your own button. */
export function DropdownMenuTrigger({
  ref,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  ...props
}: DropdownMenuTriggerProps): React.JSX.Element {
  const context = useDropdownMenuContext();
  const setRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      context.triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [context.triggerRef, ref],
  );
  return (
    <DropdownMenuPrimitive.Trigger
      ref={setRef}
      data-slot="dropdown-menu-trigger"
      onPointerEnter={composeEventHandlers(onPointerEnter, (event: React.PointerEvent<HTMLButtonElement>) => {
        if (context.hover && event.pointerType === "mouse") context.scheduleOpen();
      })}
      onPointerLeave={composeEventHandlers(onPointerLeave, (event: React.PointerEvent<HTMLButtonElement>) => {
        if (context.hover && event.pointerType === "mouse") context.scheduleClose();
      })}
      onPointerDown={composeEventHandlers(onPointerDown, (event: React.PointerEvent<HTMLButtonElement>) => {
        // The menu may open under the pointer (coverTrigger); don't let this press's release select an item.
        context.pressingTrigger.current = true;
        window.addEventListener(
          "pointerup",
          () => window.setTimeout(() => (context.pressingTrigger.current = false)),
          { once: true },
        );
        // In hover mode a click keeps the menu open instead of toggling it shut.
        if (context.hover && event.pointerType === "mouse" && event.button === 0) {
          event.preventDefault();
          context.cancelTimers();
          context.setOpen(true);
        }
      })}
      {...props}
    />
  );
}

const menuSurface = [
  "z-50 min-w-[100px] overflow-y-auto overflow-x-hidden rounded-ui bg-surface py-0 text-foreground shadow-z2 outline-none",
  "data-[state=open]:animate-md-scale-in data-[state=closed]:animate-md-fade-out motion-reduce:animate-none!",
];

export interface DropdownMenuContentProps extends React.ComponentProps<typeof DropdownMenuPrimitive.Content> {
  /**
   * Place the menu over its trigger, like Materialize (`coverTrigger: true`).
   * When `false` the menu opens below (or above, if there is no room) the trigger.
   */
  coverTrigger?: boolean;
  /** Make the menu exactly as wide as the trigger (Materialize `constrainWidth`). */
  constrainWidth?: boolean;
  /** Portal container. Defaults to `document.body`. */
  container?: HTMLElement | null;
}

/** The menu panel, rendered in a portal and kept inside the viewport. */
export function DropdownMenuContent({
  className,
  coverTrigger = true,
  constrainWidth = false,
  align = "start",
  sideOffset,
  collisionPadding = 8,
  container,
  style,
  onPointerEnter,
  onPointerLeave,
  onPointerUpCapture,
  ...props
}: DropdownMenuContentProps): React.JSX.Element {
  const context = useDropdownMenuContext();
  const [triggerHeight, setTriggerHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    if (context.open) setTriggerHeight(context.triggerRef.current?.offsetHeight ?? 0);
  }, [context.open, context.triggerRef]);

  return (
    <DropdownMenuPrimitive.Portal container={container}>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        align={align}
        sideOffset={sideOffset ?? (coverTrigger ? -triggerHeight : 0)}
        collisionPadding={collisionPadding}
        className={cn(
          menuSurface,
          "max-h-[var(--radix-dropdown-menu-content-available-height)] origin-[var(--radix-dropdown-menu-content-transform-origin)]",
          constrainWidth && "w-[var(--radix-dropdown-menu-trigger-width)] min-w-0",
          className,
        )}
        style={style}
        onPointerUpCapture={composeEventHandlers(onPointerUpCapture, (event: React.PointerEvent<HTMLDivElement>) => {
          if (!context.pressingTrigger.current) return;
          context.pressingTrigger.current = false;
          event.stopPropagation();
        })}
        onPointerEnter={composeEventHandlers(onPointerEnter, (event: React.PointerEvent<HTMLDivElement>) => {
          if (context.hover && event.pointerType === "mouse") context.cancelTimers();
        })}
        onPointerLeave={composeEventHandlers(onPointerLeave, (event: React.PointerEvent<HTMLDivElement>) => {
          if (context.hover && event.pointerType === "mouse") context.scheduleClose();
        })}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

const itemBase = [
  "relative flex min-h-[50px] w-full cursor-pointer select-none items-center gap-6 px-4 py-3.5 text-left text-base leading-[22px] text-secondary outline-none",
  "transition-colors data-[highlighted]:bg-surface-hover data-[highlighted]:text-secondary-focus",
  "data-[disabled]:pointer-events-none data-[disabled]:cursor-default data-[disabled]:text-disabled-foreground",
  "[&_svg]:size-6 [&_svg]:shrink-0 [&_.material-icons]:text-2xl",
];

export interface DropdownMenuItemProps extends React.ComponentProps<typeof DropdownMenuPrimitive.Item> {
  /** Indent the item to line up with checkbox and radio items. */
  inset?: boolean;
  /** Use the error color for destructive actions. */
  destructive?: boolean;
}

/** A menu action (Materialize `.dropdown-content li > a`). Put an icon first to show it on the left. */
export function DropdownMenuItem({ className, inset, destructive, ...props }: DropdownMenuItemProps): React.JSX.Element {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(itemBase, inset && "pl-14", destructive && "text-error data-[highlighted]:text-error", className)}
      {...props}
    />
  );
}

export type DropdownMenuCheckboxItemProps = React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>;

/** A toggleable item with a check mark (`role="menuitemcheckbox"`). */
export function DropdownMenuCheckboxItem({ className, children, ...props }: DropdownMenuCheckboxItemProps): React.JSX.Element {
  return (
    <DropdownMenuPrimitive.CheckboxItem data-slot="dropdown-menu-checkbox-item" className={cn(itemBase, "pl-14", className)} {...props}>
      <span className="absolute left-4 flex size-6 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

export type DropdownMenuRadioGroupProps = React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>;

/** Groups radio items; controls the selected `value`. */
export function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps): React.JSX.Element {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

export type DropdownMenuRadioItemProps = React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>;

/** A single-choice item (`role="menuitemradio"`). */
export function DropdownMenuRadioItem({ className, children, ...props }: DropdownMenuRadioItemProps): React.JSX.Element {
  return (
    <DropdownMenuPrimitive.RadioItem data-slot="dropdown-menu-radio-item" className={cn(itemBase, "pl-14", className)} {...props}>
      <span className="absolute left-4 flex size-6 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <span className="block size-2.5 rounded-full bg-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

export interface DropdownMenuLabelProps extends React.ComponentProps<typeof DropdownMenuPrimitive.Label> {
  /** Indent the label to line up with checkbox and radio items. */
  inset?: boolean;
}

/** A non-interactive heading inside the menu. */
export function DropdownMenuLabel({ className, inset, ...props }: DropdownMenuLabelProps): React.JSX.Element {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn("px-4 pb-1 pt-3 text-sm font-medium text-muted-foreground", inset && "pl-14", className)}
      {...props}
    />
  );
}

export type DropdownMenuSeparatorProps = React.ComponentProps<typeof DropdownMenuPrimitive.Separator>;

/** 1px divider (Materialize `li.divider`). */
export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps): React.JSX.Element {
  return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn("h-px bg-border", className)} {...props} />;
}

export type DropdownMenuShortcutProps = React.ComponentProps<"span">;

/** Right-aligned keyboard shortcut hint. Purely visual. */
export function DropdownMenuShortcut({ className, ...props }: DropdownMenuShortcutProps): React.JSX.Element {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("ml-auto pl-6 text-sm tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
}

export type DropdownMenuGroupProps = React.ComponentProps<typeof DropdownMenuPrimitive.Group>;

/** Groups related items. */
export function DropdownMenuGroup(props: DropdownMenuGroupProps): React.JSX.Element {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

export type DropdownMenuSubProps = React.ComponentProps<typeof DropdownMenuPrimitive.Sub>;

/** A nested submenu. */
export function DropdownMenuSub(props: DropdownMenuSubProps): React.JSX.Element {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

export interface DropdownMenuSubTriggerProps extends React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> {
  /** Indent the item to line up with checkbox and radio items. */
  inset?: boolean;
}

/** The item that opens a submenu (ArrowRight / hover). */
export function DropdownMenuSubTrigger({ className, inset, children, ...props }: DropdownMenuSubTriggerProps): React.JSX.Element {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cn(itemBase, "data-[state=open]:bg-surface-hover", inset && "pl-14", className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto text-muted-foreground" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export interface DropdownMenuSubContentProps extends React.ComponentProps<typeof DropdownMenuPrimitive.SubContent> {
  /** Portal container. Defaults to `document.body`. */
  container?: HTMLElement | null;
}

/** The submenu panel. */
export function DropdownMenuSubContent({
  className,
  container,
  collisionPadding = 8,
  onPointerEnter,
  onPointerLeave,
  ...props
}: DropdownMenuSubContentProps): React.JSX.Element {
  const context = useDropdownMenuContext();
  return (
    <DropdownMenuPrimitive.Portal container={container}>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        collisionPadding={collisionPadding}
        onPointerEnter={composeEventHandlers(onPointerEnter, (event: React.PointerEvent<HTMLDivElement>) => {
          if (context.hover && event.pointerType === "mouse") context.cancelTimers();
        })}
        onPointerLeave={composeEventHandlers(onPointerLeave, (event: React.PointerEvent<HTMLDivElement>) => {
          if (context.hover && event.pointerType === "mouse") context.scheduleClose();
        })}
        className={cn(
          menuSurface,
          "max-h-[var(--radix-dropdown-menu-content-available-height)] origin-[var(--radix-dropdown-menu-content-transform-origin)]",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}
