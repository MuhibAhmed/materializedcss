"use client";

import * as React from "react";

import { useCarouselAutoplay } from "@/components/ui/carousel";
import { PauseIcon, PlayArrowIcon } from "@/components/ui/icons";
import { useControllableState } from "@/hooks/use-controllable-state";
import { cn } from "@/lib/utils";

interface SliderContextValue {
  activeIndex: number;
  count: number;
  slideLabel: (index: number, count: number) => string;
}

const SliderContext = React.createContext<SliderContextValue | null>(null);
const SliderIndexContext = React.createContext<number>(0);

export interface SliderLabels {
  goTo: (index: number, count: number) => string;
  slide: (index: number, count: number) => string;
  pause: string;
  play: string;
}

const defaultLabels: SliderLabels = {
  goTo: (index) => `Go to slide ${index + 1}`,
  slide: (index, count) => `${index + 1} of ${count}`,
  pause: "Stop automatic slide show",
  play: "Start automatic slide show",
};

export interface SliderProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  /** Accessible name of the slide show region. */
  "aria-label"?: string;
  /**
   * Height of the slides (px number or any CSS length, e.g. `"100dvh"`); the indicator row
   * adds 40px below. A height utility in `className` (e.g. `h-full`) or `style.height` sizes
   * the whole slider instead, and the slides fill what the indicators leave.
   */
  height?: number | string;
  /** Show the dot indicators below the slides. */
  indicators?: boolean;
  /** Rotate automatically. Pauses on hover and focus, and starts paused under reduced motion. */
  autoplay?: boolean;
  /** Time each slide is shown, in ms. */
  interval?: number;
  /** Crossfade and caption animation duration, in ms. */
  duration?: number;
  /** Controlled active slide. */
  activeIndex?: number;
  /** Initial slide when uncontrolled. */
  defaultIndex?: number;
  /** Called when the active slide changes. */
  onIndexChange?: (index: number) => void;
  /** Localized labels. */
  labels?: Partial<SliderLabels>;
}

/**
 * Materialize image slider: a full-width slide show with crossfading slides,
 * animated captions and indicator dots. Autoplay follows WCAG 2.2.2 (pause
 * button, pauses on hover and focus, off under reduced motion).
 */
export function Slider({
  className,
  children,
  height = 400,
  indicators = true,
  autoplay = true,
  interval = 6000,
  duration = 500,
  activeIndex,
  defaultIndex = 0,
  onIndexChange,
  labels: labelsProp,
  style,
  ...props
}: SliderProps): React.JSX.Element {
  const labels = { ...defaultLabels, ...labelsProp };
  const slides = React.Children.toArray(children).filter(React.isValidElement);
  const count = slides.length;
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const [index, setIndex] = useControllableState<number>({
    value: activeIndex,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  });
  const current = count > 0 ? ((index % count) + count) % count : 0;
  const showIndicators = indicators && count > 1;
  const slidesHeight = typeof height === "number" ? `${height}px` : height;

  const goTo = React.useCallback(
    (next: number): void => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count, setIndex],
  );

  const autoplayState = useCarouselAutoplay({
    interval: autoplay && count > 1 ? interval + duration : 0,
    onAdvance: () => goTo(current + 1),
    rootRef,
    resetKey: current,
  });

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.target !== event.currentTarget) return;
    const actions: Record<string, number> = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: count - 1 };
    const target = actions[event.key];
    if (target === undefined) return;
    event.preventDefault();
    goTo(target);
  };

  const context = React.useMemo<SliderContextValue>(
    () => ({ activeIndex: current, count, slideLabel: labels.slide }),
    [current, count, labels.slide],
  );

  return (
    <SliderContext.Provider value={context}>
      <div
        ref={rootRef}
        role="region"
        aria-roledescription="carousel"
        data-slot="slider"
        className={cn("relative flex h-(--slider-height) w-full flex-col", className)}
        style={{
          // The root carries the height (slides + indicator row, as in Materialize), so a
          // height utility in `className` or `style.height` sizes the whole slider.
          ["--slider-height" as string]: showIndicators ? `calc(${slidesHeight} + 2.5rem)` : slidesHeight,
          ...style,
          ["--slider-duration" as string]: `${duration}ms`,
        }}
        {...props}
      >
        <div
          data-slot="slider-slides"
          tabIndex={0}
          aria-live={autoplayState.playing ? "off" : "polite"}
          onKeyDown={onKeyDown}
          className="relative min-h-0 flex-1 overflow-hidden bg-md-grey-500 outline-none focus-visible:focus-ring"
        >
          {slides.map((child, i) => (
            <SliderIndexContext.Provider key={child.key ?? i} value={i}>
              {child}
            </SliderIndexContext.Provider>
          ))}
          <span className="sr-only">{count > 0 ? labels.slide(current, count) : null}</span>
        </div>

        {autoplayState.enabled ? (
          <button
            type="button"
            data-slot="slider-autoplay"
            aria-label={autoplayState.paused ? labels.play : labels.pause}
            onClick={autoplayState.togglePaused}
            className="absolute right-3 top-3 z-10 inline-flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white outline-none transition-colors hover:bg-black/65 focus-visible:focus-ring [&_svg]:size-5"
          >
            {autoplayState.paused ? <PlayArrowIcon /> : <PauseIcon />}
          </button>
        ) : null}

        {showIndicators ? (
          <div data-slot="slider-indicators" className="flex h-10 shrink-0 items-center justify-center gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={labels.goTo(i, count)}
                aria-current={i === current ? "true" : undefined}
                onClick={() => goTo(i)}
                className="group/indicator inline-flex size-8 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:focus-ring"
              >
                <span className="size-4 rounded-full bg-md-grey-300 transition-colors duration-300 group-hover/indicator:bg-md-grey-400 group-aria-[current]/indicator:bg-success dark:bg-md-grey-700" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </SliderContext.Provider>
  );
}

export interface SliderItemProps extends React.ComponentProps<"div"> {}

/** One slide. Put an `<img>` (it covers the slide) and an optional `SliderCaption` inside. */
export function SliderItem({ className, children, ...props }: SliderItemProps): React.JSX.Element {
  const context = React.useContext(SliderContext);
  const index = React.useContext(SliderIndexContext);
  if (!context) throw new Error("SliderItem must be used inside <Slider>");
  const active = index === context.activeIndex;

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={context.slideLabel(index, context.count)}
      data-slot="slider-item"
      data-active={active ? "" : undefined}
      inert={!active ? true : undefined}
      className={cn(
        "group/slide absolute inset-0 z-[1] overflow-hidden opacity-0 transition-opacity duration-(--slider-duration) ease-out-quad data-[active]:z-[2] data-[active]:opacity-100 motion-reduce:transition-none",
        "[&>img]:size-full [&>img]:object-cover",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SliderCaptionProps extends React.ComponentProps<"div"> {
  /** Text alignment and the direction the caption slides in from. */
  align?: "left" | "center" | "right";
}

const captionAlign: Record<NonNullable<SliderCaptionProps["align"]>, string> = {
  left: "text-left -translate-x-[100px]",
  center: "text-center -translate-y-[100px]",
  right: "text-right translate-x-[100px]",
};

/** Caption that fades and slides in after its slide appears (from the left, top or right). */
export function SliderCaption({ className, align = "center", ...props }: SliderCaptionProps): React.JSX.Element {
  return (
    <div
      data-slot="slider-caption"
      data-align={align}
      className={cn(
        "absolute left-[15%] top-[15%] w-[70%] text-white opacity-0 [text-shadow:0_1px_3px_rgb(0_0_0/0.45)]",
        "transition-[opacity,translate] duration-(--slider-duration) ease-out-quad motion-reduce:transition-none",
        "group-data-[active]/slide:translate-x-0 group-data-[active]/slide:translate-y-0 group-data-[active]/slide:opacity-100 group-data-[active]/slide:delay-(--slider-duration)",
        captionAlign[align],
        className,
      )}
      {...props}
    />
  );
}
