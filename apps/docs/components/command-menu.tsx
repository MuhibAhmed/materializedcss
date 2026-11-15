"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";

import type { NavSection } from "~/lib/site";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** Ctrl/⌘+K page search. */
export function CommandMenu({ sections }: { sections: NavSection[] }): React.JSX.Element {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const listId = React.useId();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sections.flatMap((section) =>
      section.items
        .filter((item) => !needle || item.title.toLowerCase().includes(needle))
        .map((item) => ({ ...item, section: section.title })),
    );
  }, [query, sections]);

  React.useEffect(() => setIndex(0), [query]);

  const go = (href: string): void => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-9 w-full cursor-pointer items-center gap-2 rounded-sm bg-black/20 px-3 text-sm text-white transition-colors hover:bg-black/30 focus-visible:outline-2 focus-visible:outline-white sm:w-56"
        >
          <SearchIcon className="size-5" />
          <span className="flex-1 text-left">Search docs…</span>
          <kbd className="hidden rounded-sm bg-black/25 px-1.5 font-mono text-[11px] text-white sm:inline">Ctrl K</kbd>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay data-[state=open]:animate-md-fade-in data-[state=closed]:animate-md-fade-out" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[12vh] z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-md bg-surface text-foreground shadow-z5 data-[state=open]:animate-md-scale-in"
        >
          <Dialog.Title className="sr-only">Search documentation</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <SearchIcon className="size-5 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setIndex((value) => Math.min(value + 1, results.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setIndex((value) => Math.max(value - 1, 0));
                } else if (event.key === "Enter" && results[index]) {
                  event.preventDefault();
                  go(results[index].href);
                }
              }}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={results[index] ? `${listId}-${index}` : undefined}
              aria-label="Search pages"
              placeholder="Search components and guides…"
              className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul id={listId} role="listbox" aria-label="Pages" className="max-h-[50vh] overflow-y-auto p-2">
            {results.length === 0 ? <li className="px-3 py-6 text-center text-sm text-muted-foreground">No results.</li> : null}
            {results.map((item, i) => (
              <li
                key={item.href}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === index}
                onMouseMove={() => setIndex(i)}
                onClick={() => go(item.href)}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-sm px-3 py-2 text-sm",
                  i === index ? "bg-secondary/12 text-foreground" : "text-foreground/80",
                )}
              >
                <span>{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.section}</span>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
