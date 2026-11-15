import * as React from "react";

import { cn } from "@/lib/utils";

export interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  /** Width and height in px or any CSS length. Defaults to `1em` so icons follow the font size. */
  size?: number | string;
  /** Accessible label. Without it the icon is decorative (`aria-hidden`). */
  title?: string;
}

export type SvgIcon = (props: SvgIconProps) => React.JSX.Element;

/** Build an icon component from a 24×24 Material Design SVG path. */
export function createIcon(path: string, displayName: string): SvgIcon {
  function Icon({ size = "1em", title, className, ...props }: SvgIconProps): React.JSX.Element {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        aria-hidden={title ? undefined : true}
        role={title ? "img" : undefined}
        focusable="false"
        className={cn("inline-block shrink-0", className)}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        <path d={path} />
      </svg>
    );
  }
  Icon.displayName = displayName;
  return Icon;
}

// Material Design icon paths (Apache 2.0, google/material-design-icons).
export const CloseIcon: SvgIcon = createIcon(
  "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  "CloseIcon",
);
export const CheckIcon: SvgIcon = createIcon("M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z", "CheckIcon");
export const ChevronLeftIcon: SvgIcon = createIcon("M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z", "ChevronLeftIcon");
export const ChevronRightIcon: SvgIcon = createIcon("M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z", "ChevronRightIcon");
export const ExpandMoreIcon: SvgIcon = createIcon("M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z", "ExpandMoreIcon");
export const ExpandLessIcon: SvgIcon = createIcon("M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z", "ExpandLessIcon");
export const ArrowDropDownIcon: SvgIcon = createIcon("M7 10l5 5 5-5z", "ArrowDropDownIcon");
export const MenuIcon: SvgIcon = createIcon("M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z", "MenuIcon");
export const SearchIcon: SvgIcon = createIcon(
  "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  "SearchIcon",
);
export const AddIcon: SvgIcon = createIcon("M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z", "AddIcon");
export const RemoveIcon: SvgIcon = createIcon("M19 13H5v-2h14v2z", "RemoveIcon");
export const CancelIcon: SvgIcon = createIcon(
  "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z",
  "CancelIcon",
);
export const CalendarIcon: SvgIcon = createIcon(
  "M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z",
  "CalendarIcon",
);
export const ClockIcon: SvgIcon = createIcon(
  "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  "ClockIcon",
);
export const MoreVertIcon: SvgIcon = createIcon(
  "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
  "MoreVertIcon",
);
export const AttachFileIcon: SvgIcon = createIcon(
  "M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z",
  "AttachFileIcon",
);
export const ErrorIcon: SvgIcon = createIcon(
  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
  "ErrorIcon",
);

export interface MaterialIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Ligature name from Google's Material Icons font, e.g. `"cloud"`. */
  name: string;
  /** Font size in px or any CSS length. */
  size?: number | string;
}

/**
 * Renders a Material Icons ligature (the icon font Materialize uses). Add
 * `<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">`
 * to your document head. Decorative by default; pass `aria-label` to expose it.
 */
export function MaterialIcon({ name, size, className, style, ...props }: MaterialIconProps): React.JSX.Element {
  const labelled = props["aria-label"] !== undefined;
  return (
    <span
      aria-hidden={labelled ? undefined : true}
      role={labelled ? "img" : undefined}
      translate="no"
      className={cn("material-icons inline-block shrink-0 select-none leading-none", className)}
      style={{ fontSize: size, ...style }}
      {...props}
    >
      {name}
    </span>
  );
}
