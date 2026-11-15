"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { useControllableState } from "@/hooks/use-controllable-state";
import { useRipple } from "@/hooks/use-ripple";
import { cn, composeEventHandlers } from "@/lib/utils";

/** Materialize animates the indicator edges over 300ms with easeOutQuad; the trailing edge waits 90ms. */
const INDICATOR_DURATION_MS = 300;
const INDICATOR_TRAIL_DELAY_MS = 90;
const EASE_OUT_QUAD = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";

const TabsValueContext = React.createContext<string>("");

interface TabsListContextValue {
  transparent: boolean;
  fixedWidth: boolean;
}

const TabsListContext = React.createContext<TabsListContextValue>({ transparent: false, fixedWidth: false });

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

export interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {}

/**
 * Material tabs (Materialize `.tabs`). Built on Radix Tabs: roving focus, arrow
 * keys, Home/End, automatic or manual activation and RTL via `dir`.
 */
export function Tabs({ value, defaultValue, onValueChange, className, ...props }: TabsProps): React.JSX.Element {
  const [current, setCurrent] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });

  return (
    <TabsValueContext.Provider value={current}>
      <TabsPrimitive.Root
        data-slot="tabs"
        value={current}
        onValueChange={setCurrent}
        className={cn("w-full", className)}
        {...props}
      />
    </TabsValueContext.Provider>
  );
}

export interface TabsListProps extends React.ComponentProps<typeof TabsPrimitive.List> {
  /** Stretch every tab to an equal share of the width (Materialize `.tabs-fixed-width`). */
  fixedWidth?: boolean;
  /** White text and indicator on a transparent background, for colored toolbars (Materialize `.tabs-transparent`). */
  transparent?: boolean;
  /** Extra classes for the sliding indicator, e.g. `bg-secondary` to recolor it. */
  indicatorClassName?: string;
}

interface IndicatorRect {
  left: number;
  right: number;
}

/**
 * The horizontally scrollable tab strip with the animated underline indicator.
 * The indicator is measured with a ResizeObserver, so it stays aligned after
 * font loading, resizes, scrollbars, RTL, zoom animations and when the tabs
 * were first rendered inside a hidden (`display: none`) parent.
 */
export function TabsList({
  className,
  fixedWidth = false,
  transparent = false,
  indicatorClassName,
  children,
  ref,
  ...props
}: TabsListProps): React.JSX.Element {
  const value = React.useContext(TabsValueContext);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const indicatorRef = React.useRef<HTMLSpanElement | null>(null);
  const lastRef = React.useRef<{ value: string; rect: IndicatorRect } | null>(null);
  const valueRef = React.useRef(value);
  valueRef.current = value;

  const setListRef = React.useCallback(
    (node: HTMLDivElement | null): void => {
      listRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  /** Position the indicator under the active tab. Animates only when the active tab changed. */
  const update = React.useCallback((allowAnimation: boolean): void => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;
    const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!active || list.offsetWidth === 0) {
      indicator.style.opacity = "0";
      return;
    }

    const listRect = list.getBoundingClientRect();
    const tabRect = active.getBoundingClientRect();
    // Undo CSS transforms on ancestors (e.g. a modal's zoom-in) by comparing with layout sizes.
    const scale = listRect.width / list.offsetWidth || 1;
    const left = (tabRect.left - listRect.left) / scale - list.clientLeft + list.scrollLeft;
    const width = tabRect.width / scale;
    const rect: IndicatorRect = { left, right: list.clientWidth - left - width };

    const last = lastRef.current;
    const unchanged =
      last !== null &&
      last.value === valueRef.current &&
      Math.abs(last.rect.left - rect.left) < 0.5 &&
      Math.abs(last.rect.right - rect.right) < 0.5;
    if (unchanged && indicator.style.opacity === "1") return;
    const changed = last !== null && last.value !== valueRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (allowAnimation && changed && last && !reduced && indicator.style.opacity !== "0") {
      // The leading edge moves first and the trailing edge follows 90ms later: the signature stretch.
      const movingRight = rect.left > last.rect.left;
      const leftDelay = movingRight ? INDICATOR_TRAIL_DELAY_MS : 0;
      const rightDelay = movingRight ? 0 : INDICATOR_TRAIL_DELAY_MS;
      indicator.style.transition = `left ${INDICATOR_DURATION_MS}ms ${EASE_OUT_QUAD} ${leftDelay}ms, right ${INDICATOR_DURATION_MS}ms ${EASE_OUT_QUAD} ${rightDelay}ms`;
    } else if (!last || last.value !== valueRef.current || !allowAnimation) {
      indicator.style.transition = "none";
    }
    indicator.style.left = `${rect.left}px`;
    indicator.style.right = `${rect.right}px`;
    indicator.style.opacity = "1";
    lastRef.current = { value: valueRef.current, rect };
  }, []);

  /** Scroll the list (never the page) so the active tab is fully visible. */
  const revealActive = React.useCallback((smooth: boolean): void => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    const listRect = list.getBoundingClientRect();
    const tabRect = active.getBoundingClientRect();
    let delta = 0;
    if (tabRect.left < listRect.left) delta = tabRect.left - listRect.left;
    else if (tabRect.right > listRect.left + list.clientWidth) delta = tabRect.right - (listRect.left + list.clientWidth);
    if (delta === 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left: delta, behavior: smooth && !reduced ? "smooth" : "auto" });
  }, []);

  // Re-measure whenever the list, any tab or the active tab changes size.
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const schedule = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => update(false));
    };
    const resizeObserver = new ResizeObserver(schedule);
    const observeTabs = (): void => {
      resizeObserver.disconnect();
      resizeObserver.observe(list);
      list.querySelectorAll('[role="tab"]').forEach((tab) => resizeObserver.observe(tab));
    };
    observeTabs();
    const mutationObserver = new MutationObserver(() => {
      observeTabs();
      schedule();
    });
    mutationObserver.observe(list, { childList: true });
    // Fonts change tab widths without resizing the list in some browsers.
    void document.fonts?.ready.then(schedule);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [update]);

  // Animate on value changes and keep the active tab in view.
  const isFirstRender = React.useRef(true);
  React.useLayoutEffect(() => {
    update(true);
    revealActive(!isFirstRender.current);
    isFirstRender.current = false;
  }, [value, update, revealActive]);

  const context = React.useMemo<TabsListContextValue>(() => ({ transparent, fixedWidth }), [transparent, fixedWidth]);

  return (
    <TabsListContext.Provider value={context}>
      <TabsPrimitive.List
        ref={setListRef}
        data-slot="tabs-list"
        data-fixed-width={fixedWidth ? "" : undefined}
        data-transparent={transparent ? "" : undefined}
        className={cn(
          "relative flex w-full overflow-x-auto overflow-y-hidden whitespace-nowrap [scrollbar-width:thin]",
          transparent ? "bg-transparent" : "bg-surface",
          className,
        )}
        {...props}
      >
        {children}
        <span
          ref={indicatorRef}
          aria-hidden="true"
          data-slot="tabs-indicator"
          style={{ left: 0, right: "100%", opacity: 0 }}
          className={cn(
            "pointer-events-none absolute bottom-0 h-0.5 will-change-[left,right]",
            transparent ? "bg-white" : "bg-primary",
            indicatorClassName,
          )}
        />
      </TabsPrimitive.List>
    </TabsListContext.Provider>
  );
}

export interface TabsTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  /** Show the Material ink ripple on press. */
  ripple?: boolean;
}

/**
 * Radix focuses a tab from script on mousedown, which Chrome treats as `:focus-visible`, so a plain
 * click would show the keyboard focus ring and tint. Mark pointer-initiated focus and hide them for it;
 * the mark is cleared on the next key press or blur so keyboard focus stays clearly visible.
 */
function markPointerFocus(event: React.PointerEvent<HTMLButtonElement>): void {
  event.currentTarget.setAttribute("data-pointer-focus", "");
}

function clearPointerFocus(event: React.SyntheticEvent<HTMLButtonElement>): void {
  event.currentTarget.removeAttribute("data-pointer-focus");
}

/** A single tab: uppercase 14px label, 48px tall, 24px side padding (12px on small screens). */
export function TabsTrigger({
  className,
  ripple = true,
  disabled,
  onPointerDown,
  onKeyDown,
  onBlur,
  ...props
}: TabsTriggerProps): React.JSX.Element {
  const { transparent, fixedWidth } = React.useContext(TabsListContext);
  const startRipple = useRipple({ disabled: !ripple || Boolean(disabled) });

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      disabled={disabled}
      onPointerDown={composeEventHandlers(onPointerDown, markPointerFocus, startRipple)}
      onKeyDown={composeEventHandlers(clearPointerFocus, onKeyDown)}
      onBlur={composeEventHandlers(clearPointerFocus, onBlur)}
      className={cn(
        "relative inline-flex h-12 min-w-0 shrink-0 cursor-pointer select-none items-center justify-center overflow-hidden px-6 text-sm uppercase leading-[48px] max-md:grow max-md:px-3",
        "transition-[color,background-color] duration-[280ms] ease-out",
        "outline-none focus-visible:not-data-[pointer-focus]:shadow-[inset_0_0_0_2px_var(--ring)]",
        "disabled:cursor-default disabled:pointer-events-none",
        "[&>span]:truncate [&_svg]:size-5",
        fixedWidth && "grow basis-0",
        transparent
          ? "text-white/70 hover:text-white focus-visible:not-data-[pointer-focus]:bg-white/20 data-[state=active]:text-white disabled:text-white/40"
          : "text-muted-foreground hover:text-primary focus-visible:not-data-[pointer-focus]:bg-primary/20 data-[state=active]:text-primary disabled:text-disabled-foreground",
        className,
      )}
      {...props}
    />
  );
}

export interface TabsContentProps extends React.ComponentProps<typeof TabsPrimitive.Content> {}

/** The panel shown for the active tab. */
export function TabsContent({ className, ...props }: TabsContentProps): React.JSX.Element {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("outline-none focus-visible:focus-ring", className)}
      {...props}
    />
  );
}
