"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavSection } from "~/lib/site";
import { cn } from "@/lib/utils";

export function DocsNav({ sections, onNavigate }: { sections: NavSection[]; onNavigate?: () => void }): React.JSX.Element {
  const pathname = usePathname();
  return (
    <nav aria-label="Documentation" className="space-y-6 text-sm">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="mb-1 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{section.title}</p>
          <ul>
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-8 items-center rounded-sm px-3 transition-colors",
                      active
                        ? "bg-secondary/12 font-medium text-secondary"
                        : "text-foreground/80 hover:bg-surface-hover hover:text-foreground",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
