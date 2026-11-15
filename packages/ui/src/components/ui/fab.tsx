"use client";

import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useControllableState } from "@/hooks/use-controllable-state";
import { cn, composeEventHandlers } from "@/lib/utils";

type FabDirection = "top" | "right" | "bottom" | "left";
type FabColor = NonNullable<ButtonProps["color"]>;

interface FabContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  direction: FabDirection;
  toolbar: boolean;
  hoverEnabled: boolean;
  color: FabColor;
  triggerId: string;
  menuId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLElement | null>;
  /** Focus the action closest to the trigger once the menu has opened (keyboard). */
  focusFirstOnOpen: React.RefObject<boolean>;
}

const FabContext = React.createContext<FabContextValue | null>(null);

function useFab(component: string): FabContextValue {
  const context = React.useContext(FabContext);
  if (!context) throw new Error(`<${component}> must be used inside <Fab>`);
  return context;
}

function getItems(menu: HTMLElement | null): HTMLElement[] {
  return menu ? Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])')) : [];
}

/** The action nearest the trigger: the last one when the list grows up or left. */
function closestItem(context: FabContextValue): HTMLElement | undefined {
  const items = getItems(context.menuRef.current);
  const reversed = !context.toolbar && (context.direction === "top" || context.direction === "left");
  return reversed ? items[items.length - 1] : items[0];
}

const toolbarColors: Record<FabColor, string> = {
  default: "bg-secondary text-secondary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  primary: "bg-primary text-primary-foreground",
  error: "bg-error text-error-foreground",
  success: "bg-success text-success-foreground",
};

export interface FabProps extends Omit<React.ComponentProps<"div">, "color"> {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the actions open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Where the mini buttons appear, relative to the main button. */
  direction?: FabDirection;
  /** Open on mouse hover (Materialize `hoverEnabled`). Clicks, touch and keyboard always work. */
  hoverEnabled?: boolean;
  /** Morph the button into a full-width toolbar of actions (Materialize `toolbarEnabled`). */
  toolbar?: boolean;
  /**
   * `fixed`: pinned 23px from the bottom-right of the viewport. `static`: in the
   * normal flow (toolbars stretch across the nearest positioned ancestor).
   */
  position?: "fixed" | "static";
  /** Color of the main button and the toolbar. */
  color?: FabColor;
}

/**
 * Material floating action button that reveals related actions
 * (Materialize `.fixed-action-btn`). Follows the WAI-ARIA menu button pattern.
 */
export function Fab({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  direction = "top",
  hoverEnabled = true,
  toolbar = false,
  position = "fixed",
  color = "primary",
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  onBlur,
  ...props
}: FabProps): React.JSX.Element {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLElement | null>(null);
  const focusFirstOnOpen = React.useRef(false);
  const id = React.useId();
  const hover = hoverEnabled && !toolbar;

  const value = React.useMemo<FabContextValue>(
    () => ({
      open,
      setOpen,
      direction,
      toolbar,
      hoverEnabled: hover,
      color,
      triggerId: `${id}-trigger`,
      menuId: `${id}-menu`,
      triggerRef,
      menuRef,
      focusFirstOnOpen,
    }),
    [open, setOpen, direction, toolbar, hover, color, id],
  );

  React.useEffect(() => {
    if (!open) return;
    if (focusFirstOnOpen.current) {
      focusFirstOnOpen.current = false;
      closestItem(value)?.focus();
    }
    const onPointerDown = (event: PointerEvent): void => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    // Safari does not focus a button on click, so Escape may never reach the trigger.
    // Close on Escape from outside too; inside, the trigger and actions handle it.
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const active = document.activeElement;
      if (active instanceof Node && rootRef.current?.contains(active)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen, value]);

  return (
    <FabContext.Provider value={value}>
      <div
        ref={rootRef}
        data-slot="fab"
        data-state={open ? "open" : "closed"}
        data-direction={direction}
        className={cn(
          toolbar
            ? cn("pointer-events-none inset-x-0 bottom-0 z-40 h-14", position === "fixed" ? "fixed" : "absolute")
            : position === "fixed"
              ? "fixed bottom-[23px] right-[23px] z-40"
              : "relative inline-flex",
          className,
        )}
        onPointerEnter={composeEventHandlers(onPointerEnter, (event: React.PointerEvent<HTMLDivElement>) => {
          if (hover && event.pointerType === "mouse") setOpen(true);
        })}
        onPointerLeave={composeEventHandlers(onPointerLeave, (event: React.PointerEvent<HTMLDivElement>) => {
          if (hover && event.pointerType === "mouse") setOpen(false);
        })}
        onBlur={composeEventHandlers(onBlur, (event: React.FocusEvent<HTMLDivElement>) => {
          const next = event.relatedTarget;
          if (next instanceof Node && event.currentTarget.contains(next)) return;
          if (next) setOpen(false);
        })}
        {...props}
      >
        {children}
      </div>
    </FabContext.Provider>
  );
}

export interface FabTriggerProps extends Omit<ButtonProps, "variant"> {
  /** Accessible name, e.g. "Quick actions". Required: the button only shows an icon. */
  "aria-label": string;
}

/** The large floating button that toggles the actions. */
export function FabTrigger({
  className,
  size = "lg",
  color,
  onClick,
  onKeyDown,
  onPointerDown,
  ...props
}: FabTriggerProps): React.JSX.Element {
  const context = useFab("FabTrigger");
  const pointerType = React.useRef<string>("");
  return (
    <Button
      ref={context.triggerRef}
      id={context.triggerId}
      variant="floating"
      size={size}
      color={color ?? context.color}
      aria-haspopup="menu"
      aria-expanded={context.open}
      aria-controls={context.menuId}
      data-slot="fab-trigger"
      data-state={context.open ? "open" : "closed"}
      className={cn(
        "pointer-events-auto transition-[background-color,box-shadow,color,scale,opacity] duration-200",
        context.toolbar && "absolute bottom-[23px] right-[23px] data-[state=open]:pointer-events-none data-[state=open]:scale-0 data-[state=open]:opacity-0",
        className,
      )}
      onPointerDown={composeEventHandlers(onPointerDown, (event: React.PointerEvent<HTMLButtonElement>) => {
        pointerType.current = event.pointerType;
      })}
      onClick={composeEventHandlers(onClick, (event: React.MouseEvent<HTMLButtonElement>) => {
        const keyboard = event.detail === 0;
        const viaMouseHover = context.hoverEnabled && pointerType.current === "mouse" && !keyboard;
        pointerType.current = "";
        if (viaMouseHover) {
          context.setOpen(true);
          return;
        }
        if (!context.open && keyboard) context.focusFirstOnOpen.current = true;
        context.setOpen(!context.open);
      })}
      onKeyDown={composeEventHandlers(onKeyDown, (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
          event.preventDefault();
          if (context.open) closestItem(context)?.focus();
          else {
            context.focusFirstOnOpen.current = true;
            context.setOpen(true);
          }
        } else if (event.key === "Escape" && context.open) {
          event.preventDefault();
          context.setOpen(false);
        }
      })}
      {...props}
    />
  );
}

const listPlacement: Record<FabDirection, string> = {
  top: "bottom-14 left-1/2 -translate-x-1/2 flex-col pb-[15px]",
  bottom: "top-14 left-1/2 -translate-x-1/2 flex-col pt-[15px]",
  left: "right-14 top-1/2 -translate-y-1/2 flex-row pr-[15px]",
  right: "left-14 top-1/2 -translate-y-1/2 flex-row pl-[15px]",
};

const itemClosed: Record<FabDirection, string> = {
  top: "translate-y-10",
  bottom: "-translate-y-10",
  left: "translate-x-10",
  right: "-translate-x-10",
};

export interface FabActionsProps extends React.ComponentProps<"div"> {
  /** Accessible name of the menu. Defaults to the trigger's label. */
  "aria-label"?: string;
}

/**
 * The mini buttons (`role="menu"`). Each child is wrapped in a `role="none"` item.
 * Rendered as divs rather than a list so page list styles never leak in.
 */
export function FabActions({ className, children, onKeyDown, ...props }: FabActionsProps): React.JSX.Element {
  const context = useFab("FabActions");
  const { open, direction, toolbar } = context;
  const items = React.Children.toArray(children).filter(React.isValidElement);
  const reversed = !toolbar && (direction === "top" || direction === "left");
  const horizontal = toolbar || direction === "left" || direction === "right";

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    const list = getItems(context.menuRef.current);
    const index = list.indexOf(document.activeElement as HTMLElement);
    let next: HTMLElement | undefined;
    switch (event.key) {
      case "ArrowUp":
      case "ArrowLeft":
        next = list[(index - 1 + list.length) % list.length];
        break;
      case "ArrowDown":
      case "ArrowRight":
        next = list[(index + 1) % list.length];
        break;
      case "Home":
        next = list[0];
        break;
      case "End":
        next = list[list.length - 1];
        break;
      case "Escape":
        event.preventDefault();
        context.setOpen(false);
        context.triggerRef.current?.focus();
        return;
      case "Tab":
        context.setOpen(false);
        return;
      default:
        return;
    }
    event.preventDefault();
    next?.focus();
  };

  const list = (
    <div
      ref={context.menuRef as React.Ref<HTMLDivElement>}
      id={context.menuId}
      role="menu"
      aria-labelledby={props["aria-label"] ? undefined : context.triggerId}
      aria-orientation={horizontal ? "horizontal" : "vertical"}
      data-slot="fab-actions"
      data-state={open ? "open" : "closed"}
      className={cn(
        "m-0 flex list-none items-center p-0",
        toolbar ? "h-full w-full items-stretch" : cn("absolute gap-[15px]", listPlacement[direction], !open && "pointer-events-none"),
        className,
      )}
      onKeyDown={(event) => {
        const handledBefore = event.defaultPrevented;
        onKeyDown?.(event);
        // A tooltip on the focused action handles Escape first (and prevents it); the menu still closes.
        if (!event.defaultPrevented || (handledBefore && event.key === "Escape")) handleKeyDown(event);
      }}
      {...props}
    >
      {items.map((child, index) => {
        const distance = reversed ? items.length - 1 - index : index;
        return (
          <div
            key={child.key ?? index}
            role="none"
            className={cn(
              // Visibility flips instantly on open (so the nearest action can take focus right away)
              // and is transitioned on close (so items stay visible while they fade out).
              open ? "transition-[opacity,scale,translate]" : "transition-[opacity,scale,translate,visibility]",
              "ease-in-out motion-reduce:transition-none",
              toolbar
                ? cn("flex flex-1 items-stretch duration-200", open ? "opacity-100" : "invisible opacity-0")
                : open
                  ? "visible scale-100 opacity-100 duration-250"
                  : cn("invisible scale-40 opacity-0 duration-175", itemClosed[direction]),
            )}
            style={{ transitionDelay: open ? `${(toolbar ? 100 : 0) + distance * 40}ms` : "0ms" }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );

  if (!toolbar) return list;
  return (
    <div
      data-slot="fab-toolbar"
      data-state={open ? "open" : "closed"}
      className={cn(
        "pointer-events-auto absolute inset-x-0 bottom-0 h-14 overflow-hidden shadow-z2",
        "transition-[clip-path,visibility] duration-300 ease-in-out motion-reduce:transition-none",
        "[clip-path:circle(28px_at_calc(100%-51px)_5px)] data-[state=open]:[clip-path:circle(150%_at_calc(100%-51px)_5px)]",
        "data-[state=closed]:invisible",
        toolbarColors[context.color],
      )}
    >
      {list}
    </div>
  );
}

export interface FabActionProps extends Omit<ButtonProps, "variant"> {
  /** Accessible name of the action (also use it for a tooltip). */
  label: string;
}

/** One mini floating button (`role="menuitem"`). Activating it closes the menu. */
export function FabAction({ label, className, size = "md", color, onClick, ...props }: FabActionProps): React.JSX.Element {
  const context = useFab("FabAction");
  return (
    <Button
      role="menuitem"
      tabIndex={-1}
      aria-label={label}
      variant={context.toolbar ? "flat" : "floating"}
      size={size}
      color={context.toolbar ? "default" : color}
      data-slot="fab-action"
      className={cn(context.toolbar && "h-14 w-full rounded-none text-inherit", className)}
      onClick={composeEventHandlers(onClick, (event: React.MouseEvent<HTMLButtonElement>) => {
        const hadFocus = event.currentTarget === document.activeElement && event.detail === 0;
        context.setOpen(false);
        if (hadFocus) context.triggerRef.current?.focus();
      })}
      {...props}
    />
  );
}
