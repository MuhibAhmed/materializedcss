"use client";

import * as React from "react";
import { Dialog } from "radix-ui";

import { useControllableState } from "@/hooks/use-controllable-state";
import { CloseIcon } from "@/components/ui/icons";
import { cn, prefersReducedMotion } from "@/lib/utils";

/** Accumulated wheel / touch movement (px) that closes the zoomed image. */
const SCROLL_CLOSE_DISTANCE = 60;
const EASING = "cubic-bezier(0.215, 0.61, 0.355, 1)";

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Fit the image inside 90% of the viewport (Materialize's sizing), keeping its aspect ratio. */
function fitRect(aspect: number, captionSpace: number): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight - captionSpace;
  let width = vw * 0.9;
  let height = width / aspect;
  if (height > vh * 0.9) {
    height = vh * 0.9;
    width = height * aspect;
  }
  return { left: (vw - width) / 2, top: (vh - height) / 2, width, height };
}

function flipTransform(from: Rect, to: Rect): string {
  const sx = from.width / to.width;
  const sy = from.height / to.height;
  return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${sx}, ${sy})`;
}

export interface MaterialboxProps extends Omit<React.ComponentProps<"img">, "alt" | "src"> {
  /** Image URL of the thumbnail. */
  src: string;
  /** Alternative text. Required: it also names the zoom button and the dialog. */
  alt: string;
  /** Higher-resolution image shown when zoomed. Defaults to `src`. */
  zoomSrc?: string;
  /** Caption shown under the zoomed image (Materialize `data-caption`). */
  caption?: React.ReactNode;
  /** Controlled open (zoomed) state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the image zooms in or out. */
  onOpenChange?: (open: boolean) => void;
  /** Zoom-in duration in ms (Materialize `inDuration`). */
  inDuration?: number;
  /** Zoom-out duration in ms (Materialize `outDuration`). */
  outDuration?: number;
  /** Classes for the trigger button that wraps the thumbnail. */
  triggerClassName?: string;
}

/**
 * Click-to-zoom image (Materialize Materialbox). The image animates from its
 * place on the page to fit the viewport (FLIP) inside a Radix Dialog: focus
 * moves into the dialog, Escape/click/scroll closes it and focus returns.
 */
export function Materialbox({
  src,
  alt,
  zoomSrc,
  caption,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  inDuration = 275,
  outDuration = 200,
  className,
  triggerClassName,
  width,
  height,
  ...props
}: MaterialboxProps): React.JSX.Element {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const thumbRef = React.useRef<HTMLImageElement | null>(null);
  const zoomRef = React.useRef<HTMLImageElement | null>(null);
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const captionRef = React.useRef<HTMLParagraphElement | null>(null);
  const closing = React.useRef(false);
  const animatedIn = React.useRef(false);
  const scrolled = React.useRef(0);
  const touchY = React.useRef<number | null>(null);
  const [target, setTarget] = React.useState<Rect | null>(null);

  const captionSpace = caption ? 50 : 0;

  const measure = React.useCallback((): Rect | null => {
    const thumb = thumbRef.current;
    if (!thumb) return null;
    const rect = thumb.getBoundingClientRect();
    const aspect =
      thumb.naturalWidth && thumb.naturalHeight ? thumb.naturalWidth / thumb.naturalHeight : rect.width / Math.max(1, rect.height);
    return fitRect(aspect, captionSpace);
  }, [captionSpace]);

  // Opening: place the image at its final rect, then animate from the thumbnail (FLIP).
  React.useLayoutEffect(() => {
    if (!open) return;
    closing.current = false;
    animatedIn.current = false;
    scrolled.current = 0;
    setTarget(measure());
  }, [open, measure]);

  React.useLayoutEffect(() => {
    const zoom = zoomRef.current;
    const thumb = thumbRef.current;
    if (!open || !target || !zoom || !thumb || closing.current || animatedIn.current) return;
    animatedIn.current = true;
    if (prefersReducedMotion()) return;
    const from = thumb.getBoundingClientRect();
    zoom.animate([{ transform: flipTransform(from, target) }, { transform: "none" }], {
      duration: inDuration,
      easing: EASING,
    });
    overlayRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: inDuration, easing: EASING });
    captionRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: inDuration, easing: EASING });
  }, [open, target, inDuration]);

  React.useEffect(() => {
    if (!open) return;
    const onResize = (): void => setTarget(measure());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, measure]);

  const close = React.useCallback(() => {
    const zoom = zoomRef.current;
    const thumb = thumbRef.current;
    if (closing.current) return;
    closing.current = true;
    if (!zoom || !thumb || !target || prefersReducedMotion()) {
      setOpen(false);
      return;
    }
    const to = thumb.getBoundingClientRect();
    const options: KeyframeAnimationOptions = { duration: outDuration, easing: EASING, fill: "forwards" };
    overlayRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], options);
    captionRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], options);
    const animation = zoom.animate([{ transform: "none" }, { transform: flipTransform(to, target) }], options);
    animation.onfinish = () => setOpen(false);
    animation.oncancel = () => setOpen(false);
  }, [outDuration, setOpen, target]);

  const handleOpenChange = (next: boolean): void => {
    if (next) setOpen(true);
    else close();
  };

  const onScrollIntent = (delta: number): void => {
    scrolled.current += Math.abs(delta);
    if (scrolled.current > SCROLL_CLOSE_DISTANCE) close();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger
        data-slot="materialbox-trigger"
        aria-label={`Enlarge image: ${alt}`}
        className={cn(
          "inline-block max-w-full cursor-zoom-in rounded-ui p-0 align-top outline-none focus-visible:focus-ring",
          "data-[state=open]:[&_img]:invisible",
          triggerClassName,
        )}
      >
        <img
          ref={thumbRef}
          data-slot="materialbox"
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn("block h-auto max-w-full", className)}
          {...props}
        />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content
          data-slot="materialbox-dialog"
          className="fixed inset-0 z-[1000] cursor-zoom-out outline-none"
          onEscapeKeyDown={(event) => {
            event.preventDefault();
            close();
          }}
          onClick={close}
          onWheel={(event) => onScrollIntent(event.deltaY)}
          onTouchStart={(event) => {
            touchY.current = event.touches[0]?.clientY ?? null;
          }}
          onTouchMove={(event) => {
            const y = event.touches[0]?.clientY;
            if (y === undefined || touchY.current === null) return;
            onScrollIntent(y - touchY.current);
            touchY.current = y;
          }}
        >
          <Dialog.Title className="sr-only">{alt}</Dialog.Title>
          <div ref={overlayRef} aria-hidden="true" className="absolute inset-0 bg-md-grey-900/95" />
          {target ? (
            <img
              ref={zoomRef}
              src={zoomSrc ?? src}
              alt={alt}
              className="fixed max-w-none origin-top-left select-none object-contain shadow-z5"
              style={{ left: target.left, top: target.top, width: target.width, height: target.height }}
              draggable={false}
            />
          ) : null}
          {caption ? (
            <Dialog.Description
              ref={captionRef}
              className="fixed inset-x-0 bottom-0 flex h-[50px] items-center justify-center px-[15%] text-center text-white antialiased"
            >
              {caption}
            </Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">Press Escape or click to close.</Dialog.Description>
          )}
          <Dialog.Close
            aria-label="Close"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              close();
            }}
            className="fixed right-3 top-3 inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-white/85 outline-none transition-colors hover:bg-white/15 hover:text-white focus-visible:focus-ring"
          >
            <CloseIcon className="size-6" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
