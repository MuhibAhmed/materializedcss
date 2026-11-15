import * as React from "react";

import { cn } from "@/lib/utils";

export interface ResponsiveImageProps extends React.ComponentProps<"img"> {
  /** Crop the image to a circle (Materialize `.circle`). Use a square image. */
  circle?: boolean;
}

/**
 * Image that never grows wider than its container (Materialize `.responsive-img`).
 * Always pass a meaningful `alt` (or `alt=""` for decorative images) and, when
 * known, `width`/`height` to avoid layout shift.
 */
export function ResponsiveImage({ className, circle = false, alt, ...props }: ResponsiveImageProps): React.JSX.Element {
  return (
    <img
      data-slot="responsive-image"
      alt={alt}
      className={cn("block h-auto max-w-full", circle && "aspect-square rounded-full object-cover", className)}
      {...props}
    />
  );
}

export interface CircleImageProps extends Omit<React.ComponentProps<"img">, "width" | "height"> {
  /** Diameter in px or any CSS length. */
  size?: number | string;
}

/** Round avatar-style image (Materialize `img.circle`). */
export function CircleImage({ className, size = 80, style, alt, ...props }: CircleImageProps): React.JSX.Element {
  return (
    <img
      data-slot="circle-image"
      alt={alt}
      width={typeof size === "number" ? size : undefined}
      height={typeof size === "number" ? size : undefined}
      className={cn("inline-block shrink-0 rounded-full object-cover", className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  );
}

export interface VideoContainerProps extends React.ComponentProps<"div"> {
  /** Aspect ratio as a number (`16 / 9`) or a CSS ratio string (`"4 / 3"`). */
  ratio?: number | string;
}

/**
 * Responsive embed (Materialize `.video-container`): keeps an `<iframe>`,
 * `<video>` or `<object>` at a fixed aspect ratio (16:9 by default) using CSS
 * `aspect-ratio` instead of the padding hack.
 */
export function VideoContainer({ className, ratio = 16 / 9, style, ...props }: VideoContainerProps): React.JSX.Element {
  return (
    <div
      data-slot="video-container"
      className={cn(
        "relative w-full overflow-hidden",
        "[&>embed]:absolute [&>embed]:inset-0 [&>embed]:size-full [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:size-full [&>iframe]:border-0 [&>object]:absolute [&>object]:inset-0 [&>object]:size-full [&>video]:absolute [&>video]:inset-0 [&>video]:size-full",
        className,
      )}
      style={{ aspectRatio: typeof ratio === "number" ? String(ratio) : ratio, ...style }}
      {...props}
    />
  );
}

/** `<video>` that scales down with its container (Materialize `video.responsive-video`). */
export function ResponsiveVideo({ className, ...props }: React.ComponentProps<"video">): React.JSX.Element {
  return <video data-slot="responsive-video" className={cn("block h-auto max-w-full", className)} {...props} />;
}
