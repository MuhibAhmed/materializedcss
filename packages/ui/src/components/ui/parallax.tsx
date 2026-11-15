"use client";

import * as React from "react";

import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type ParallaxMode = "static" | "scroll-timeline" | "fallback";

type ViewTimelineConstructor = new (options: { subject: Element; axis?: "block" | "inline" | "x" | "y" }) => AnimationTimeline;

/**
 * A view timeline tracks the nearest scroll container. An `overflow: hidden`
 * ancestor (a card, a carousel...) is a scroll container that never scrolls,
 * which would freeze the effect, so the scroll-handler fallback is used instead.
 */
function insideStaticScrollContainer(element: HTMLElement): boolean {
  for (let node = element.parentElement; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
    const style = getComputedStyle(node);
    const scrollable = (value: string): boolean => value !== "visible" && value !== "clip";
    if (!scrollable(style.overflowX) && !scrollable(style.overflowY)) continue;
    const scrollsVertically = (style.overflowY === "auto" || style.overflowY === "scroll") && node.scrollHeight > node.clientHeight;
    return !scrollsVertically;
  }
  return false;
}

export interface ParallaxProps extends React.ComponentProps<"div"> {
  /** Background image URL. */
  src: string;
  /** Alternative text. Leave empty (default) for decorative backgrounds. */
  alt?: string;
  /** Height of the container (px number or CSS length). */
  height?: number | string;
  /** How much slower the image moves, from 0 (none) to 1. The image is `1 + speed` times the container height. */
  speed?: number;
  /** Extra classes for the `<img>`. */
  imageClassName?: string;
}

/**
 * Materialize parallax container: the background image scrolls slower than the
 * page. Uses CSS scroll-driven animations (a `ViewTimeline`, off the main
 * thread) when supported, otherwise a passive scroll handler that only runs
 * while the container is on screen. Disabled when the user prefers reduced motion.
 */
export function Parallax({
  src,
  alt = "",
  height = 500,
  speed = 0.5,
  className,
  imageClassName,
  children,
  style,
  ...props
}: ParallaxProps): React.JSX.Element {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [mode, setMode] = React.useState<ParallaxMode>("static");
  const extra = Math.max(0, Math.min(1, speed));
  // Share of the image height the image travels: it starts bottom-aligned and ends top-aligned.
  const travelPercent = (extra / (1 + extra)) * 100;

  React.useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image || reducedMotion || extra === 0) {
      setMode("static");
      return;
    }

    const ViewTimelineImpl = (window as unknown as { ViewTimeline?: ViewTimelineConstructor }).ViewTimeline;
    if (ViewTimelineImpl && CSS.supports("animation-timeline: view()") && !insideStaticScrollContainer(container)) {
      setMode("scroll-timeline");
      const animation = image.animate(
        [{ transform: "translateY(0)" }, { transform: `translateY(${travelPercent}%)` }],
        { timeline: new ViewTimelineImpl({ subject: container, axis: "block" }), fill: "both", easing: "linear" },
      );
      return () => animation.cancel();
    }

    setMode("fallback");
    let frame = 0;
    const update = (): void => {
      frame = 0;
      const rect = container.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (viewport - rect.top) / (rect.height + viewport)));
      const distance = image.offsetHeight - container.offsetHeight;
      image.style.transform = `translateY(${progress * distance}px)`;
    };
    const schedule = (): void => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    let listening = false;
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry?.isIntersecting ?? false;
      if (visible && !listening) {
        // Capture so scrolling of any ancestor (not only the page) moves the image.
        window.addEventListener("scroll", schedule, { passive: true, capture: true });
        window.addEventListener("resize", schedule, { passive: true });
        listening = true;
        schedule();
      } else if (!visible && listening) {
        window.removeEventListener("scroll", schedule, { capture: true });
        window.removeEventListener("resize", schedule);
        listening = false;
      }
    });
    observer.observe(container);
    update();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      image.style.transform = `translateY(${travelPercent / 2}%)`;
    };
  }, [reducedMotion, extra, travelPercent]);

  return (
    <div
      ref={containerRef}
      data-slot="parallax"
      data-mode={mode}
      className={cn("relative isolate overflow-hidden", className)}
      style={{ height: typeof height === "number" ? `${height}px` : height, ...style }}
      {...props}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        data-slot="parallax-image"
        decoding="async"
        draggable={false}
        style={{
          height: `${(1 + extra) * 100}%`,
          // Centered until the effect starts (and permanently under reduced motion).
          transform: `translateY(${travelPercent / 2}%)`,
        }}
        className={cn("pointer-events-none absolute inset-x-0 bottom-0 -z-10 w-full max-w-none select-none object-cover", imageClassName)}
      />
      {children}
    </div>
  );
}
