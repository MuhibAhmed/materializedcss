"use client";

import * as React from "react";

import { palette, type PaletteColor } from "@/lib/palette";
import { cn } from "@/lib/utils";

/** WCAG relative luminance of sRGB channels in 0..1. */
function luminance([r, g, b]: [number, number, number]): number {
  const linear = (value: number): number => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** Pick black or white text for a background hex: whichever has the higher WCAG contrast. */
export function readableOn(hex: string): string {
  const rgb = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255) as [number, number, number];
  const background = luminance(rgb);
  // The dark option is 87% black, so it is composited over the background.
  const text = luminance(rgb.map((channel) => channel * 0.13) as [number, number, number]);
  const onWhite = 1.05 / (background + 0.05);
  const onBlack = (background + 0.05) / (text + 0.05);
  // A few mid-tone shades need solid black to reach AA (4.5:1).
  if (Math.max(onWhite, onBlack) < 4.5) return "#000000";
  return onBlack >= onWhite ? "rgba(0,0,0,0.87)" : "#ffffff";
}

const MATERIALIZE_NAMES: Record<string, string> = {
  "50": "lighten-5",
  "100": "lighten-4",
  "200": "lighten-3",
  "300": "lighten-2",
  "400": "lighten-1",
  "500": "base",
  "600": "darken-1",
  "700": "darken-2",
  "800": "darken-3",
  "900": "darken-4",
  a100: "accent-1",
  a200: "accent-2",
  a400: "accent-3",
  a700: "accent-4",
};

/** The full Material palette; click a swatch to copy its utility class. */
export function PaletteGrid(): React.JSX.Element {
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(palette) as PaletteColor[]).map((name) => {
        const shades = palette[name] as Record<string, string>;
        const base = shades["500"] ?? "#000";
        return (
          <section key={name} aria-label={name} className="overflow-hidden rounded-md shadow-z1">
            <div className="flex h-24 flex-col justify-end p-4" style={{ background: base }}>
              <p className="m-0 text-lg font-medium capitalize" style={{ color: readableOn(base) }}>{name.replace(/-/g, " ")}</p>
              <p className="m-0 font-mono text-xs" style={{ color: readableOn(base) }}>
                {base}
              </p>
            </div>
            <ul className="m-0 list-none p-0">
              {Object.entries(shades).map(([shade, hex]) => {
                const utility = `bg-md-${name}-${shade}`;
                return (
                  <li key={shade}>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard?.writeText(utility).then(() => setCopied(utility));
                      }}
                      className={cn(
                        "flex h-9 w-full cursor-pointer items-center justify-between px-4 font-mono text-xs outline-none focus-visible:focus-ring focus-visible:-outline-offset-2",
                        shade === "a100" && "mt-1",
                      )}
                      style={{ background: hex, color: readableOn(hex) }}
                    >
                      <span>
                        <span className="sr-only">Copy {utility}: </span>
                        {copied === utility ? "Copied!" : shade}
                        <span className="ml-2">{MATERIALIZE_NAMES[shade]}</span>
                      </span>
                      <span>{hex}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
