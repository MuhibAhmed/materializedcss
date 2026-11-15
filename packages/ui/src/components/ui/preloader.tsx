import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const preloaderVariants = cva(
  "relative inline-block shrink-0 animate-md-spinner-rotate motion-reduce:animate-[md-container-rotate_4s_linear_infinite]",
  {
    variants: {
      size: {
        sm: "size-9",
        md: "size-[50px]",
        lg: "size-16",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const tokenColors = {
  secondary: "text-secondary",
  primary: "text-primary",
  error: "text-error",
  success: "text-success",
  current: "text-current",
} as const;

export type PreloaderColor = keyof typeof tokenColors;

// The four Google colors Materialize's multi-color spinner cycles through. Each
// layer fades in for a quarter of the 5332ms cycle. Classes are spelled out in
// full so Tailwind can see them.
const multiLayerClasses = [
  "text-[#4285f4] opacity-0 [animation:md-fill-unfill-rotate_5332ms_cubic-bezier(0.4,0,0.2,1)_infinite_both,md-blue-fade-in-out_5332ms_cubic-bezier(0.4,0,0.2,1)_infinite_both] motion-reduce:animate-none motion-reduce:opacity-100",
  "text-[#db4437] opacity-0 [animation:md-fill-unfill-rotate_5332ms_cubic-bezier(0.4,0,0.2,1)_infinite_both,md-red-fade-in-out_5332ms_cubic-bezier(0.4,0,0.2,1)_infinite_both] motion-reduce:animate-none",
  "text-[#f4b400] opacity-0 [animation:md-fill-unfill-rotate_5332ms_cubic-bezier(0.4,0,0.2,1)_infinite_both,md-yellow-fade-in-out_5332ms_cubic-bezier(0.4,0,0.2,1)_infinite_both] motion-reduce:animate-none",
  "text-[#0f9d58] opacity-0 [animation:md-fill-unfill-rotate_5332ms_cubic-bezier(0.4,0,0.2,1)_infinite_both,md-green-fade-in-out_5332ms_cubic-bezier(0.4,0,0.2,1)_infinite_both] motion-reduce:animate-none",
] as const;

const circleBase = "absolute inset-y-0 h-full rounded-full border-[3px] border-solid motion-reduce:animate-none";

function SpinnerLayer({ className }: { className?: string }): React.JSX.Element {
  return (
    <div data-slot="preloader-layer" className={cn("absolute inset-0", className)}>
      <div className="relative inline-block h-full w-1/2 overflow-hidden">
        <div
          className={cn(
            circleBase,
            "left-0 w-[200%] [transform:rotate(129deg)] motion-reduce:[transform:rotate(-5deg)] [border-color:currentColor_transparent_transparent_currentColor]",
            "animate-[md-left-spin_1333ms_cubic-bezier(0.4,0,0.2,1)_infinite_both]",
          )}
        />
      </div>
      <div className="absolute top-0 left-[45%] h-full w-[10%] overflow-hidden">
        <div className={cn(circleBase, "left-[-450%] w-[1000%] [border-color:currentColor_currentColor_transparent_currentColor]")} />
      </div>
      <div className="relative inline-block h-full w-1/2 overflow-hidden">
        <div
          className={cn(
            circleBase,
            "left-[-100%] w-[200%] [transform:rotate(-129deg)] motion-reduce:[transform:rotate(5deg)] [border-color:currentColor_currentColor_transparent_transparent]",
            "animate-[md-right-spin_1333ms_cubic-bezier(0.4,0,0.2,1)_infinite_both]",
          )}
        />
      </div>
    </div>
  );
}

export interface PreloaderProps extends Omit<React.ComponentProps<"div">, "color"> {
  /** `sm` 36px, `md` 50px (default) or `lg` 64px (Materialize `.small` / `.big`). */
  size?: "sm" | "md" | "lg" | null | undefined;
  /**
   * Arc color: a theme color name, or any CSS color (e.g. `"#3f51b5"`,
   * `"var(--color-md-indigo-500)"`). Ignored when `multicolor` is set.
   */
  color?: PreloaderColor | (string & {});
  /** Cycle through blue, red, yellow and green like Materialize's `.spinner-layer` colors. */
  multicolor?: boolean;
  /** Accessible name announced by screen readers. */
  label?: string;
}

/**
 * Circular indeterminate spinner (Materialize `.preloader-wrapper`), with the
 * same container rotation and fill/unfill arc timings. With reduced motion it
 * becomes a slowly turning static arc.
 */
export function Preloader({
  className,
  size,
  color = "secondary",
  multicolor = false,
  label = "Loading",
  style,
  ...props
}: PreloaderProps): React.JSX.Element {
  const tokenClass = color in tokenColors ? tokenColors[color as PreloaderColor] : undefined;
  return (
    <div
      role="status"
      aria-label={label}
      data-slot="preloader"
      className={cn(preloaderVariants({ size }), !multicolor && tokenClass, className)}
      style={!multicolor && !tokenClass ? { color, ...style } : style}
      {...props}
    >
      {multicolor ? (
        multiLayerClasses.map((layerClass) => <SpinnerLayer key={layerClass} className={layerClass} />)
      ) : (
        <SpinnerLayer className="animate-[md-fill-unfill-rotate_5332ms_cubic-bezier(0.4,0,0.2,1)_infinite_both] motion-reduce:animate-none" />
      )}
    </div>
  );
}
