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

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
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
