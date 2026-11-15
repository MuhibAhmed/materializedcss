"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface SimpleTab {
  value: string;
  label: string;
  content: React.ReactNode;
}

/** Lightweight underline tabs used by the docs chrome (preview/code, install methods). */
export function SimpleTabs({
  tabs,
  className,
  listClassName,
  label,
}: {
  tabs: SimpleTab[];
  className?: string;
  listClassName?: string;
  label: string;
}): React.JSX.Element {
  const [active, setActive] = React.useState(tabs[0]?.value ?? "");
  const id = React.useId();
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: React.KeyboardEvent, index: number): void => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + tabs.length) % tabs.length;
    const tab = tabs[next];
    if (!tab) return;
    setActive(tab.value);
    refs.current[next]?.focus();
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className={cn("flex gap-1 border-b border-border", listClassName)}>
        {tabs.map((tab, index) => {
          const selected = tab.value === active;
          return (
            <button
              key={tab.value}
              ref={(node) => {
                refs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${tab.value}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${tab.value}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.value)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "relative -mb-px cursor-pointer px-4 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors",
                "border-b-2 outline-none focus-visible:bg-surface-hover",
                selected ? "border-secondary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.value}
          role="tabpanel"
          id={`${id}-panel-${tab.value}`}
          aria-labelledby={`${id}-tab-${tab.value}`}
          hidden={tab.value !== active}
          className="pt-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
