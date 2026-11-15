"use client";

import * as React from "react";

import { palette, type PaletteColor } from "@/lib/palette";
import { cn } from "@/lib/utils";

/** Pick black or white text for a background hex (WCAG relative luminance). */
export function readableOn(hex: string): string {
  const channel = (offset: number): number => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  return luminance > 0.36 ? "rgba(0,0,0,0.87)" : "#ffffff";
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(palette) as PaletteColor[]).map((name) => {
        const shades = palette[name] as Record<string, string>;
        const base = shades["500"] ?? "#000";
        return (
          <section key={name} aria-label={name} className="overflow-hidden rounded-md shadow-z1">
            <div className="flex h-24 flex-col justify-end p-4" style={{ background: base }}>
              <p className="m-0 text-lg font-medium capitalize" style={{ color: readableOn(base) }}>{name.replace(/-/g, " ")}</p>
              <p className="m-0 font-mono text-xs opacity-80" style={{ color: readableOn(base) }}>
                {base}
              </p>
            </div>
            <ul>
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
                      aria-label={`Copy ${utility} (${hex})`}
                    >
                      <span>
                        {copied === utility ? "Copied!" : shade}
                        <span className="ml-2 opacity-70">{MATERIALIZE_NAMES[shade]}</span>
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
