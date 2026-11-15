"use client";

import * as React from "react";

import { CopyButton } from "~/components/docs/copy-button";
import { readableOn } from "~/components/palette-grid";
import { palette, type PaletteColor } from "@/lib/palette";
import { cn } from "@/lib/utils";

const STYLE_ID = "md-theme-customizer";
const RADII = [0, 2, 4, 8, 12] as const;
const CHROMATIC = (Object.keys(palette) as PaletteColor[]).filter((name) => name !== "grey" && name !== "blue-grey" && name !== "brown");

type Shades = Record<string, string>;

function shades(name: PaletteColor): Shades {
  return palette[name] as Shades;
}

export interface ThemeChoice {
  primary: PaletteColor;
  secondary: PaletteColor;
  radius: (typeof RADII)[number];
}

export const DEFAULT_THEME: ThemeChoice = { primary: "materialize-red", secondary: "teal", radius: 2 };

function tokenBlock(prefix: "primary" | "secondary", name: PaletteColor): { light: string[]; dark: string[] } {
  const s = shades(name);
  // 700 keeps white text at WCAG AA for almost every hue; 300 does the same for dark text in dark mode.
  const base = s["700"] ?? "#000000";
  const darkBase = s["300"] ?? "#ffffff";
  const light = [
    `--${prefix}: ${base};`,
    `--${prefix}-foreground: ${readableOn(base)};`,
    `--${prefix}-light: ${s["100"] ?? base};`,
    `--${prefix}-dark: ${s["900"] ?? base};`,
  ];
  const dark = [
    `--${prefix}: ${darkBase};`,
    `--${prefix}-foreground: ${readableOn(darkBase)};`,
    `--${prefix}-light: ${s["900"] ?? darkBase};`,
    `--${prefix}-dark: ${s["100"] ?? darkBase};`,
  ];
  if (prefix === "secondary") {
    light.push(`--secondary-hover: ${s["800"] ?? base};`, `--secondary-focus: ${s["900"] ?? base};`);
    dark.push(`--secondary-hover: ${s["200"] ?? darkBase};`, `--secondary-focus: ${s["100"] ?? darkBase};`);
  }
  return { light, dark };
}

/** CSS for a theme choice, ready to paste after `@import "materializedcss/theme.css"`. */
export function themeCss(choice: ThemeChoice): string {
  const primary = tokenBlock("primary", choice.primary);
  const secondary = tokenBlock("secondary", choice.secondary);
  const indent = (lines: string[]): string => lines.map((line) => `  ${line}`).join("\n");
  return `:root {\n  --radius: ${choice.radius}px;\n${indent(primary.light)}\n${indent(secondary.light)}\n}\n\n.dark {\n${indent(primary.dark)}\n${indent(secondary.dark)}\n}`;
}

function Swatches({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PaletteColor;
  onChange: (value: PaletteColor) => void;
}): React.JSX.Element {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-foreground">{label}</legend>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {CHROMATIC.map((name) => {
          const selected = name === value;
          const color = shades(name)["700"] ?? "#000";
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={name.replace(/-/g, " ")}
              title={name}
              onClick={() => onChange(name)}
              className={cn(
                "size-8 cursor-pointer rounded-full outline-none transition-transform hover:scale-110 focus-visible:focus-ring",
                selected && "ring-2 ring-foreground ring-offset-2 ring-offset-surface",
              )}
              style={{ background: color }}
            />
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Pick primary/secondary palette colors and the corner radius. The theme is
 * applied to the whole docs site live, and the generated CSS can be copied.
 */
export function ThemeCustomizer({ className }: { className?: string }): React.JSX.Element {
  const [choice, setChoice] = React.useState<ThemeChoice>(DEFAULT_THEME);
  const [applied, setApplied] = React.useState(false);
  const css = themeCss(choice);

  React.useEffect(() => {
    if (!applied) return;
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = css;
  }, [applied, css]);

  const update = (patch: Partial<ThemeChoice>): void => {
    setChoice((current) => ({ ...current, ...patch }));
    setApplied(true);
  };

  const reset = (): void => {
    document.getElementById(STYLE_ID)?.remove();
    setChoice(DEFAULT_THEME);
    setApplied(false);
  };

  return (
    <div className={cn("grid gap-6 rounded-md border border-border bg-surface p-6 shadow-z1 md:grid-cols-[1fr_1.1fr]", className)}>
      <div className="space-y-6">
        <Swatches label="Primary" value={choice.primary} onChange={(primary) => update({ primary })} />
        <Swatches label="Secondary" value={choice.secondary} onChange={(secondary) => update({ secondary })} />
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground">Radius</legend>
          <div role="radiogroup" aria-label="Radius" className="flex flex-wrap gap-2">
            {RADII.map((radius) => (
              <button
                key={radius}
                type="button"
                role="radio"
                aria-checked={choice.radius === radius}
                onClick={() => update({ radius })}
                className={cn(
                  "h-9 min-w-12 cursor-pointer rounded-ui border px-3 font-mono text-sm outline-none focus-visible:focus-ring",
                  choice.radius === radius
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-border text-foreground hover:bg-surface-hover",
                )}
              >
                {radius}px
              </button>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer text-sm font-medium uppercase tracking-wide text-secondary outline-none hover:underline focus-visible:focus-ring"
        >
          Reset to default
        </button>
      </div>
      <div className="relative min-w-0">
        <div className="absolute right-2 top-2">
          <CopyButton value={css} />
        </div>
        <pre className="h-full max-h-[340px] overflow-auto rounded-md bg-surface-2 p-4 pr-12 font-mono text-[12px] leading-5 text-foreground">
          {css}
        </pre>
      </div>
    </div>
  );
}
