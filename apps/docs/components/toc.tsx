"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
}

/** "On this page" list built from the `<h2 id>` headings of the current doc. */
export function TableOfContents(): React.JSX.Element | null {
  const pathname = usePathname();
  const [headings, setHeadings] = React.useState<Heading[]>([]);
  const [active, setActive] = React.useState<string>("");

  React.useEffect(() => {
    const nodes = [...document.querySelectorAll<HTMLHeadingElement>("[data-doc-content] h2[id]")];
    setHeadings(nodes.map((node) => ({ id: node.id, text: node.textContent?.replace(/#$/, "").trim() ?? "" })));
    if (!nodes.length) return;

    // The active heading is the last one scrolled past the sticky header (plus some slack), or
    // the last heading once the page is scrolled to the bottom. Computed from positions on every
    // scroll frame, so it is never stale, unlike observing headings entering a band.
    const OFFSET = 120;
    let frame = 0;
    const update = (): void => {
      frame = 0;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = nodes[0]!;
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= OFFSET) current = node;
        else break;
      }
      setActive(atBottom ? nodes[nodes.length - 1]!.id : current.id);
    };
    const onScroll = (): void => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-2 font-medium text-foreground">On this page</p>
      <ul className="space-y-1.5 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "-ml-px block border-l-2 pl-3 transition-colors",
                active === heading.id
                  ? "border-secondary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
