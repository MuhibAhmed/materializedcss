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
      <div role="tablist" aria-label={label} className={cn(
          // The bottom rule is an inset shadow so the row can scroll sideways on narrow screens
          // without clipping the active tab's indicator.
          "flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-border)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          listClassName,
        )}>
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
                "relative shrink-0 cursor-pointer whitespace-nowrap px-3 py-2.5 sm:px-4 text-sm font-medium uppercase tracking-wide transition-colors",
                "border-b-2 outline-none focus-visible:bg-surface-hover focus-visible:inset-ring-2 focus-visible:inset-ring-ring",
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
