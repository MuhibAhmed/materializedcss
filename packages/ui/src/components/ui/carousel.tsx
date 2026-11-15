"use client";

import * as React from "react";

import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayArrowIcon } from "@/components/ui/icons";
import { useControllableState } from "@/hooks/use-controllable-state";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------------------------------
 * Autoplay (shared with Slider)
 * -----------------------------------------------------------------------------------------------*/

export interface UseCarouselAutoplayOptions {
  /** Milliseconds between automatic advances. `0` (or less) disables autoplay. */
  interval: number;
  /** Called on every tick to show the next slide. */
  onAdvance: () => void;
  /** The carousel root: hovering it or focusing anything inside it pauses rotation. */
  rootRef: React.RefObject<HTMLElement | null>;
  /** Restart the countdown whenever this value changes (e.g. the active index). */
  resetKey?: unknown;
}

export interface CarouselAutoplayState {
  /** Autoplay is configured (interval > 0). */
  enabled: boolean;
  /** Slides are currently rotating. */
  playing: boolean;
  /** Rotation was stopped with the pause button (or by default under reduced motion). */
  paused: boolean;
  /** Toggle the user pause state (wire to a visible pause/play button). */
  togglePaused: () => void;
}

/**
 * Automatic rotation that satisfies WCAG 2.2.2: it pauses while the pointer is
 * over the carousel or focus is inside it, while the page is hidden, starts
 * paused when the user prefers reduced motion, and exposes a pause toggle.
 */
export function useCarouselAutoplay({ interval, onAdvance, rootRef, resetKey }: UseCarouselAutoplayOptions): CarouselAutoplayState {
  const enabled = interval > 0;
  const reducedMotion = usePrefersReducedMotion();
  const [userPaused, setUserPaused] = React.useState<boolean | null>(null);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const paused = userPaused ?? reducedMotion;
  const playing = enabled && !paused && !hovered && !focused && !hidden;

  const onAdvanceRef = React.useRef(onAdvance);
  React.useEffect(() => {
    onAdvanceRef.current = onAdvance;
  });

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;
    const enter = (event: PointerEvent): void => {
      if (event.pointerType === "mouse") setHovered(true);
    };
    const leave = (): void => setHovered(false);
    const focusIn = (event: FocusEvent): void => {
      // Only keyboard-style focus pauses; a mouse click on a control should not freeze rotation forever.
      if ((event.target as Element | null)?.matches?.(":focus-visible")) setFocused(true);
    };
    const focusOut = (event: FocusEvent): void => {
      if (!root.contains(event.relatedTarget as Node | null)) setFocused(false);
    };
    const visibility = (): void => setHidden(document.visibilityState === "hidden");
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("focusin", focusIn);
    root.addEventListener("focusout", focusOut);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("focusin", focusIn);
      root.removeEventListener("focusout", focusOut);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [rootRef, enabled]);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => onAdvanceRef.current(), interval);
    return () => window.clearInterval(id);
  }, [playing, interval, resetKey]);

  const togglePaused = React.useCallback(() => setUserPaused((prev) => !(prev ?? reducedMotion)), [reducedMotion]);

  return { enabled, playing, paused, togglePaused };
}

/* -------------------------------------------------------------------------------------------------
 * Carousel
 * -----------------------------------------------------------------------------------------------*/

/** Imperative API, like Materialize's `instance.next()`, `prev()` and `set()`. */
export interface CarouselHandle {
  /** Move forward `n` slides (default 1). */
  next: (n?: number) => void;
  /** Move back `n` slides (default 1). */
  prev: (n?: number) => void;
  /** Go to the slide at `index`. */
  set: (index: number) => void;
}

interface CarouselContextValue {
  count: number;
  activeIndex: number;
  fullWidth: boolean;
  slideLabel: (index: number, count: number) => string;
  register: (index: number, node: HTMLDivElement | null) => void;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);
const CarouselIndexContext = React.createContext<number>(0);

export interface CarouselProps extends Omit<React.ComponentProps<"div">, "ref" | "onChange"> {
  /** Imperative handle with `next`, `prev` and `set`. */
  ref?: React.Ref<CarouselHandle>;
  /** Accessible name of the carousel region. Required unless `aria-labelledby` is set. */
  "aria-label"?: string;
  /** Full-width slider mode: one slide fills the carousel (Materialize `fullWidth`). */
  fullWidth?: boolean;
  /** Show dot indicators (buttons) at the bottom. */
  indicators?: boolean;
  /** Show previous / next buttons. */
  controls?: boolean;
  /** Stop at the first and last slide instead of cycling. */
  noWrap?: boolean;
  /** Depth of the 3D cover-flow: translateZ of side items (Materialize `dist`). */
  dist?: number;
  /** Extra spacing around the center item, in px. */
  shift?: number;
  /** Spacing between side items, in px. */
  padding?: number;
  /** Number of items visible in the 3D mode. */
  numVisible?: number;
  /** Settling time constant in ms for the snap / momentum animation. */
  duration?: number;
  /** Height of the carousel (px number or any CSS length). */
  height?: number | string;
  /** Controlled active slide index. */
  activeIndex?: number;
  /** Initially active slide when uncontrolled. */
  defaultIndex?: number;
  /** Called when the centered slide changes. */
  onIndexChange?: (index: number) => void;
  /** Rotate automatically: `true` for every 5000ms or a number of ms. Pauses on hover, focus and reduced motion. */
  autoplay?: boolean | number;
  /** Labels for the built-in buttons (localization). */
  labels?: Partial<CarouselLabels>;
  /** Content pinned over the slides, e.g. a call-to-action button (Materialize `.carousel-fixed-item`). */
  fixedContent?: React.ReactNode;
}

export interface CarouselLabels {
  previous: string;
  next: string;
  goTo: (index: number, count: number) => string;
  slide: (index: number, count: number) => string;
  pause: string;
  play: string;
}

const defaultLabels: CarouselLabels = {
  previous: "Previous slide",
  next: "Next slide",
  goTo: (index) => `Go to slide ${index + 1}`,
  slide: (index, count) => `${index + 1} of ${count}`,
  pause: "Stop automatic slide show",
  play: "Start automatic slide show",
};

const DRAG_THRESHOLD_PX = 8;

interface Engine {
  offset: number;
  target: number;
  amplitude: number;
  velocity: number;
  frame: number;
  timestamp: number;
  center: number;
  dim: number;
  itemWidth: number;
  itemHeight: number;
  raf: number;
  ready: boolean;
}

interface DragState {
  id: number;
  startX: number;
  startY: number;
  lastX: number;
  startOffset: number;
  horizontal: boolean | null;
}

function wrapIndex(x: number, count: number): number {
  if (count <= 0) return 0;
  return ((x % count) + count) % count;
}

/**
 * Materialize carousel: a 3D cover-flow of items, or a full-width slider with
 * indicators. Drag with mouse, touch or pen (horizontal drags only, so the page
 * still scrolls vertically), click side items, use arrow keys, the buttons, or
 * the imperative `ref` handle.
 */
export function Carousel({
  ref,
  className,
  children,
  fullWidth = false,
  indicators = false,
  controls = true,
  noWrap: noWrapProp = false,
  dist: distProp = -100,
  shift = 0,
  padding = 0,
  numVisible: numVisibleProp = 5,
  duration = 200,
  height = 400,
  activeIndex,
  defaultIndex = 0,
  onIndexChange,
  autoplay = false,
  labels: labelsProp,
  fixedContent,
  ...props
}: CarouselProps): React.JSX.Element {
  const labels = { ...defaultLabels, ...labelsProp };
  const slides = React.Children.toArray(children).filter(React.isValidElement);
  const count = slides.length;
  const noWrap = noWrapProp || count <= 1;
  const dist = fullWidth ? 0 : distProp;
  const numVisible = Math.min(count, numVisibleProp);

  const [index, setIndex] = useControllableState<number>({
    value: activeIndex,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  });

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const itemsRef = React.useRef<Array<HTMLDivElement | null>>([]);
  const engine = React.useRef<Engine>({
    offset: 0,
    target: 0,
    amplitude: 0,
    velocity: 0,
    frame: 0,
    timestamp: 0,
    center: 0,
    dim: 1,
    itemWidth: 0,
    itemHeight: 0,
    raf: 0,
    ready: false,
  });
  const dragRef = React.useRef<DragState | null>(null);
  const engineStartIndexRef = React.useRef(index);
  const suppressClickRef = React.useRef(false);

  // Latest options for the imperative engine functions.
  const optionsRef = React.useRef({ count, noWrap, dist, shift, padding, numVisible, duration, fullWidth });
  optionsRef.current = { count, noWrap, dist, shift, padding, numVisible, duration, fullWidth };
  const setIndexRef = React.useRef(setIndex);
  setIndexRef.current = setIndex;

  const register = React.useCallback((i: number, node: HTMLDivElement | null): void => {
    itemsRef.current[i] = node;
  }, []);

  /** Lay out every item for scroll offset `x` (port of Materialize's `_scroll`). */
  const scroll = React.useCallback((x?: number): void => {
    const e = engine.current;
    const viewport = viewportRef.current;
    const o = optionsRef.current;
    if (!viewport || o.count === 0) return;
    if (typeof x === "number") e.offset = x;

    const lastCenter = e.center;
    const numVisibleOffset = 1 / Math.max(1, o.numVisible);
    e.center = Math.floor((e.offset + e.dim / 2) / e.dim);
    const delta = e.offset - e.center * e.dim;
    const dir = delta < 0 ? 1 : -1;
    const tween = (-dir * delta * 2) / e.dim;
    const half = o.count >> 1;

    let alignment: string;
    let centerOpacity: number;
    if (o.fullWidth) {
      alignment = "translateX(0)";
      centerOpacity = 1;
    } else {
      alignment = `translateX(${(viewport.clientWidth - e.itemWidth) / 2}px) translateY(${(viewport.clientHeight - e.itemHeight) / 2}px)`;
      centerOpacity = 1 - numVisibleOffset * tween;
    }

    const touched = new Set<number>();
    const apply = (i: number, opacity: number, zIndex: number, transform: string): void => {
      const el = itemsRef.current[i];
      if (!el) return;
      touched.add(i);
      el.style.transform = transform;
      el.style.zIndex = String(zIndex);
      el.style.opacity = String(Math.max(0, Math.min(1, opacity)));
      el.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
    };

    for (let i = 1; i <= half; ++i) {
      let z: number;
      let opacity: number;
      // Right side.
      if (o.fullWidth) {
        z = o.dist;
        opacity = i === half && delta < 0 ? 1 - tween : 1;
      } else {
        z = o.dist * (i * 2 + tween * dir);
        opacity = 1 - numVisibleOffset * (i * 2 + tween * dir);
      }
      if (!o.noWrap || e.center + i < o.count) {
        apply(
          wrapIndex(e.center + i, o.count),
          opacity,
          -i,
          `${alignment} translateX(${o.shift + (e.dim * i - delta) / 2}px) translateZ(${z}px)`,
        );
      }
      // Left side.
      if (o.fullWidth) {
        z = o.dist;
        opacity = i === half && delta > 0 ? 1 - tween : 1;
      } else {
        z = o.dist * (i * 2 - tween * dir);
        opacity = 1 - numVisibleOffset * (i * 2 - tween * dir);
      }
      if (!o.noWrap || e.center - i >= 0) {
        apply(
          wrapIndex(e.center - i, o.count),
          opacity,
          -i,
          `${alignment} translateX(${-o.shift + (-e.dim * i - delta) / 2}px) translateZ(${z}px)`,
        );
      }
    }

    // Center item last so it wins when an even count touches one item twice.
    if (!o.noWrap || (e.center >= 0 && e.center < o.count)) {
      apply(
        wrapIndex(e.center, o.count),
        centerOpacity,
        0,
        `${alignment} translateX(${-delta / 2}px) translateX(${dir * o.shift * tween}px) translateZ(${o.dist * tween}px)`,
      );
    }

    itemsRef.current.forEach((el, i) => {
      if (el && !touched.has(i)) el.style.visibility = "hidden";
    });

    if (lastCenter !== e.center || !e.ready) {
      setIndexRef.current(wrapIndex(e.center, o.count));
    }
  }, []);

  const autoScroll = React.useCallback((): void => {
    const e = engine.current;
    if (!e.amplitude) return;
    const elapsed = Date.now() - e.timestamp;
    const delta = e.amplitude * Math.exp(-elapsed / optionsRef.current.duration);
    if (delta > 2 || delta < -2) {
      scroll(e.target - delta);
      e.raf = requestAnimationFrame(autoScroll);
    } else {
      scroll(e.target);
      e.amplitude = 0;
    }
  }, [scroll]);

  const startAnimation = React.useCallback((): void => {
    const e = engine.current;
    cancelAnimationFrame(e.raf);
    if (e.offset === e.target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      e.amplitude = 0;
      scroll(e.target);
      return;
    }
    e.amplitude = e.target - e.offset;
    e.timestamp = Date.now();
    e.raf = requestAnimationFrame(autoScroll);
  }, [autoScroll, scroll]);

  /** Port of `_cycleTo`: animate to slide `n` by the shortest path. */
  const cycleTo = React.useCallback(
    (n: number): void => {
      const e = engine.current;
      const o = optionsRef.current;
      if (o.count === 0) return;
      // While a snap animation runs, continue from where it is heading so quick
      // repeated clicks add up instead of being dropped (a Materialize bug).
      const animating = e.amplitude !== 0 && e.dim > 0;
      const from = animating ? Math.round(e.target / e.dim) : e.center;
      let diff = wrapIndex(from, o.count) - n;
      if (!o.noWrap) {
        if (diff < 0 && Math.abs(diff + o.count) < Math.abs(diff)) diff += o.count;
        else if (diff > 0 && Math.abs(diff - o.count) < diff) diff -= o.count;
      }
      e.target = animating ? from * e.dim : e.dim * Math.round(e.offset / e.dim);
      if (diff < 0) e.target += e.dim * Math.abs(diff);
      else if (diff > 0) e.target -= e.dim * diff;
      startAnimation();
    },
    [startAnimation],
  );

  const step = React.useCallback(
    (n: number): void => {
      const o = optionsRef.current;
      const e = engine.current;
      let target = (e.amplitude !== 0 && e.dim > 0 ? Math.round(e.target / e.dim) : e.center) + n;
      if (target >= o.count || target < 0) {
        if (o.noWrap) return;
        target = wrapIndex(target, o.count);
      }
      cycleTo(target);
    },
    [cycleTo],
  );

  const next = React.useCallback((n = 1): void => step(n), [step]);
  const prev = React.useCallback((n = 1): void => step(-n), [step]);
  const set = React.useCallback(
    (n: number): void => {
      const o = optionsRef.current;
      if (n >= o.count || n < 0) {
        if (o.noWrap) return;
        cycleTo(wrapIndex(n, o.count));
        return;
      }
      cycleTo(n);
    },
    [cycleTo],
  );

  React.useImperativeHandle(ref, () => ({ next, prev, set }), [next, prev, set]);

  /** Measure item size and re-layout (initial mount, resizes, option changes). */
  const measure = React.useCallback((): void => {
    const e = engine.current;
    const o = optionsRef.current;
    const first = itemsRef.current.find((el) => el != null);
    if (!first) return;
    const width = first.offsetWidth;
    const height = first.offsetHeight;
    if (width === 0) return;
    const center = e.ready ? e.center : wrapIndex(Math.round(engineStartIndexRef.current), o.count);
    e.itemWidth = width;
    e.itemHeight = height;
    e.dim = width * 2 + o.padding || 1;
    if (e.amplitude === 0 && !dragRef.current) e.offset = e.target = center * e.dim;
    scroll();
    e.ready = true;
  }, [scroll]);


  React.useLayoutEffect(() => {
    measure();
  }, [measure, count, fullWidth, padding, dist, shift, numVisible, noWrap]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    observer.observe(viewport);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measure]);

  React.useEffect(() => () => cancelAnimationFrame(engine.current.raf), []);

  // Controlled index: follow external changes.
  React.useEffect(() => {
    const e = engine.current;
    if (!e.ready || activeIndex === undefined) return;
    if (wrapIndex(e.center, optionsRef.current.count) !== activeIndex) cycleTo(activeIndex);
  }, [activeIndex, cycleTo]);

  const autoplayInterval = autoplay === true ? 5000 : autoplay === false ? 0 : autoplay;
  const autoplayState = useCarouselAutoplay({
    interval: count > 1 ? autoplayInterval : 0,
    onAdvance: () => next(),
    rootRef,
    resetKey: index,
  });

  /* ----------------------------------- Pointer dragging ----------------------------------- */

  const track = (now: number, force = false): void => {
    const e = engine.current;
    const elapsed = now - e.timestamp;
    if (elapsed < 30 && !(force && elapsed > 0 && e.offset !== e.frame)) return;
    const delta = e.offset - e.frame;
    e.timestamp = now;
    e.frame = e.offset;
    const v = (1000 * delta) / (1 + elapsed);
    e.velocity = 0.8 * v + 0.2 * e.velocity;
  };

  const release = (withMomentum: boolean, startOffset: number): void => {
    const e = engine.current;
    const o = optionsRef.current;
    if (withMomentum) track(performance.now(), true);
    const velocity = withMomentum ? e.velocity : 0;
    const startSlot = Math.round(startOffset / e.dim);
    const moved = e.offset - startOffset;
    let slot: number;
    if (o.fullWidth) {
      // A slider moves one slide per swipe: far enough or fast enough.
      slot = startSlot;
      if (moved > e.dim * 0.15 || velocity > 400) slot = startSlot + 1;
      else if (moved < -e.dim * 0.15 || velocity < -400) slot = startSlot - 1;
    } else {
      // Cover-flow keeps Materialize's momentum spin.
      const target = Math.abs(velocity) > 10 ? e.offset + 0.9 * velocity : e.offset;
      slot = Math.round(target / e.dim);
      if (slot === startSlot && Math.abs(moved) > e.dim * 0.2) slot += Math.sign(moved);
    }
    e.target = slot * e.dim;
    if (o.noWrap) {
      if (e.target >= e.dim * (o.count - 1)) e.target = e.dim * (o.count - 1);
      else if (e.target < 0) e.target = 0;
    }
    startAnimation();
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (count <= 1) return;
    suppressClickRef.current = false;
    const e = engine.current;
    cancelAnimationFrame(e.raf);
    e.amplitude = 0;
    e.velocity = 0;
    e.frame = e.offset;
    e.timestamp = performance.now();
    dragRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      startOffset: e.offset,
      horizontal: null,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    if (drag.horizontal === null) {
      const dx = Math.abs(event.clientX - drag.startX);
      const dy = Math.abs(event.clientY - drag.startY);
      if (dx > DRAG_THRESHOLD_PX && dx > dy) {
        drag.horizontal = true;
        drag.lastX = event.clientX;
        // Capture only once we know it's a horizontal drag, so plain clicks keep their target.
        event.currentTarget.setPointerCapture(event.pointerId);
      } else if (dy > DRAG_THRESHOLD_PX) {
        drag.horizontal = false;
      }
      return;
    }
    if (!drag.horizontal) return;
    const factor = optionsRef.current.fullWidth ? 2 : 1;
    const delta = (drag.lastX - event.clientX) * factor;
    drag.lastX = event.clientX;
    if (delta !== 0) scroll(engine.current.offset + delta);
    track(performance.now());
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>, momentum: boolean): void => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    if (drag.horizontal) {
      suppressClickRef.current = true;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      release(momentum, drag.startOffset);
    }
  };

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (suppressClickRef.current) {
      // The pointer was dragged: this click is the end of a swipe, not an activation.
      suppressClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (fullWidth) return;
    const item = (event.target as Element).closest<HTMLElement>('[data-slot="carousel-item"]');
    const clicked = item ? Number(item.dataset.index) : Number.NaN;
    if (Number.isNaN(clicked)) return;
    if (clicked !== wrapIndex(engine.current.center, count)) {
      // Clicking a side item brings it to the center instead of activating its content.
      event.preventDefault();
      event.stopPropagation();
      cycleTo(clicked);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.target !== event.currentTarget) return;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => prev(),
      ArrowRight: () => next(),
      Home: () => set(0),
      End: () => set(count - 1),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  const context = React.useMemo<CarouselContextValue>(
    () => ({ count, activeIndex: index, fullWidth, register, slideLabel: labels.slide }),
    [count, index, fullWidth, register, labels.slide],
  );

  const atStart = noWrap && index === 0;
  const atEnd = noWrap && index === count - 1;
  const showIndicators = indicators && count > 1;
  const overlayButton =
    "absolute z-10 inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white outline-none transition-[background-color,opacity] duration-200 hover:bg-black/65 focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-0 [&_svg]:size-6";

  return (
    <CarouselContext.Provider value={context}>
      <div
        ref={rootRef}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        data-full-width={fullWidth ? "" : undefined}
        className={cn("relative w-full", className)}
        {...props}
      >
        <div
          ref={viewportRef}
          data-slot="carousel-viewport"
          tabIndex={0}
          aria-live={autoplayState.playing ? "off" : "polite"}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(event) => endDrag(event, true)}
          onPointerCancel={(event) => endDrag(event, false)}
          onClickCapture={onClickCapture}
          onKeyDown={onKeyDown}
          onDragStart={(event) => event.preventDefault()}
          style={{ height: typeof height === "number" ? `${height}px` : height }}
          className={cn(
            "relative w-full origin-[0%_50%] touch-pan-y select-none overflow-hidden outline-none [perspective:500px] [transform-style:preserve-3d] focus-visible:focus-ring",
            count > 1 && "cursor-grab active:cursor-grabbing",
          )}
        >
          {slides.map((child, i) => (
            <CarouselIndexContext.Provider key={child.key ?? i} value={i}>
              {child}
            </CarouselIndexContext.Provider>
          ))}
          <span className="sr-only">{count > 0 ? labels.slide(index, count) : null}</span>
        </div>

        {fixedContent ? (
          <div
            data-slot="carousel-fixed"
            className={cn("pointer-events-none absolute inset-x-0 z-10 flex justify-center [&>*]:pointer-events-auto", showIndicators ? "bottom-[68px]" : "bottom-5")}
          >
            {fixedContent}
          </div>
        ) : null}

        {controls && count > 1 ? (
          <>
            <button
              type="button"
              data-slot="carousel-previous"
              aria-label={labels.previous}
              disabled={atStart}
              onClick={() => prev()}
              className={cn(overlayButton, "left-2 top-1/2 -translate-y-1/2")}
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              data-slot="carousel-next"
              aria-label={labels.next}
              disabled={atEnd}
              onClick={() => next()}
              className={cn(overlayButton, "right-2 top-1/2 -translate-y-1/2")}
            >
              <ChevronRightIcon />
            </button>
          </>
        ) : null}

        {autoplayState.enabled && count > 1 ? (
          <button
            type="button"
            data-slot="carousel-autoplay"
            aria-label={autoplayState.paused ? labels.play : labels.pause}
            onClick={autoplayState.togglePaused}
            className={cn(overlayButton, "right-2 top-2 size-9 [&_svg]:size-5")}
          >
            {autoplayState.paused ? <PlayArrowIcon /> : <PauseIcon />}
          </button>
        ) : null}

        {showIndicators ? (
          <div data-slot="carousel-indicators" className="absolute inset-x-0 bottom-0 z-10 flex justify-center py-4">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={labels.goTo(i, count)}
                aria-current={i === index ? "true" : undefined}
                onClick={() => set(i)}
                className="group/indicator inline-flex size-6 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:focus-ring"
              >
                <span
                  className={cn(
                    "size-2 rounded-full transition-colors duration-300",
                    fullWidth ? "bg-white/50 group-aria-[current]/indicator:bg-white" : "bg-input/60 group-aria-[current]/indicator:bg-primary",
                  )}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </CarouselContext.Provider>
  );
}

export interface CarouselItemProps extends React.ComponentProps<"div"> {}

/**
 * One slide. In the 3D mode items are 200×200px (override with `className`,
 * e.g. `size-60`); in `fullWidth` mode they fill the carousel.
 */
export function CarouselItem({ className, ref, children, ...props }: CarouselItemProps): React.JSX.Element {
  const context = React.useContext(CarouselContext);
  const index = React.useContext(CarouselIndexContext);
  if (!context) throw new Error("CarouselItem must be used inside <Carousel>");
  const { register, count, activeIndex, fullWidth, slideLabel } = context;
  const active = index === activeIndex;

  const setRef = React.useCallback(
    (node: HTMLDivElement | null): void => {
      register(index, node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [register, index, ref],
  );

  return (
    <div
      ref={setRef}
      role="group"
      aria-roledescription="slide"
      aria-label={slideLabel(index, count)}
      data-slot="carousel-item"
      data-index={index}
      data-active={active ? "" : undefined}
      inert={fullWidth && !active ? true : undefined}
      className={cn(
        "invisible absolute left-0 top-0 overflow-hidden [&_img]:pointer-events-none [&_img]:select-none",
        fullWidth ? "size-full" : "size-[200px] [&>img]:size-full [&>img]:object-cover",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

