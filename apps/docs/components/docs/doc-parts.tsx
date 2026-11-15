import Link from "next/link";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Page title block. */
export function DocHeader({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description: React.ReactNode;
  eyebrow?: string;
}): React.JSX.Element {
  return (
    <header className="mb-8 space-y-3">
      {eyebrow ? <p className="text-sm font-medium uppercase tracking-wider text-secondary">{eyebrow}</p> : null}
      <h1 className="text-4xl font-light tracking-tight text-foreground">{title}</h1>
      <p className="text-lg font-light text-muted-foreground">{description}</p>
    </header>
  );
}

/** A titled section; `<h2 id>` entries feed the on-page table of contents. */
export function DocSection({
  title,
  id,
  children,
  className,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  const anchor = id ?? slugify(title);
  return (
    <section className={cn("mt-12 first:mt-0", className)}>
      <h2 id={anchor} className="group mb-3 scroll-mt-24 border-b border-border pb-2 text-2xl font-normal text-foreground">
        <a href={`#${anchor}`} className="no-underline">
          {title}
          <span className="ml-2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">#</span>
        </a>
      </h2>
      <div className="docs-prose">{children}</div>
    </section>
  );
}

/** Small heading inside a section (not in the TOC). */
export function DocSubheading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <h3 className="mb-2 mt-8 text-lg font-medium text-foreground">{children}</h3>;
}

export function Callout({
  title,
  children,
  tone = "info",
}: {
  title?: string;
  children: React.ReactNode;
  tone?: "info" | "success" | "warning";
}): React.JSX.Element {
  const border = { info: "border-l-link", success: "border-l-secondary", warning: "border-l-warning" }[tone];
  return (
    <div className={cn("my-6 rounded-md border border-border border-l-4 bg-surface-2 px-5 py-4", border)}>
      {title ? <p className="mb-1 font-medium text-foreground">{title}</p> : null}
      <div className="text-sm leading-relaxed text-muted-foreground [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}

export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  description: string;
}

/** API reference table. */
export function PropsTable({ props, title }: { props: PropDoc[]; title?: string }): React.JSX.Element {
  return (
    <div className="my-4">
      {title ? <p className="mb-2 font-mono text-sm font-medium text-foreground">{title}</p> : null}
      <div
        tabIndex={0}
        role="region"
        aria-label={title ? `${title} props` : "Props"}
        className="overflow-x-auto rounded-md border border-border outline-none focus-visible:focus-ring"
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Prop</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Default</th>
              <th className="px-4 py-2.5 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop) => (
              <tr key={prop.name} className="border-t border-border align-top">
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[13px] text-secondary">{prop.name}</td>
                <td className="px-4 py-2.5 font-mono text-[12px] text-foreground">{prop.type}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] text-muted-foreground">
                  {prop.default ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{prop.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PagerLinks({
  prev,
  next,
}: {
  prev?: { title: string; href: string } | undefined;
  next?: { title: string; href: string } | undefined;
}): React.JSX.Element {
  return (
    <nav aria-label="Pagination" className="mt-16 flex items-center justify-between gap-4 border-t border-border pt-6">
      {prev ? (
        <Link href={prev.href} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeftIcon className="size-5" /> {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          {next.title} <ChevronRightIcon className="size-5" />
        </Link>
      ) : null}
    </nav>
  );
}
