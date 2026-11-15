import * as React from "react";

import { cn } from "@/lib/utils";

export interface DividerProps extends React.ComponentProps<"div"> {
  /** Direction of the line. Vertical dividers stretch to the height of a flex row. */
  orientation?: "horizontal" | "vertical";
  /**
   * Purely visual line: hidden from assistive technology (`role="none"`). By
   * default the divider is exposed as `role="separator"`.
   */
  decorative?: boolean;
}

/** 1px line in the border color (Materialize `.divider`). */
export function Divider({ className, orientation = "horizontal", decorative = false, ...props }: DividerProps): React.JSX.Element {
  return (
    <div
      data-slot="divider"
      data-orientation={orientation}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative || orientation === "horizontal" ? undefined : "vertical"}
      className={cn(
        "shrink-0 overflow-hidden bg-border",
        orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className,
      )}
      {...props}
    />
  );
}
