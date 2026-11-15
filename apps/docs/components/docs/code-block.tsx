import { CopyButton } from "~/components/docs/copy-button";
import { highlight, type CodeLang } from "~/lib/highlight";
import { cn } from "@/lib/utils";

export interface CodeBlockProps {
  code: string;
  lang?: CodeLang;
  /** Optional file name shown above the code. */
  title?: string;
  className?: string;
  /** Limit the height and scroll (long source files). */
  maxHeight?: number;
}

/** Server-rendered, syntax-highlighted code with a copy button. */
export async function CodeBlock({ code, lang = "tsx", title, className, maxHeight }: CodeBlockProps): Promise<React.JSX.Element> {
  const html = await highlight(code, lang);
  return (
    <div className={cn("group relative overflow-hidden rounded-md border border-border bg-surface-2", className)}>
      {title ? (
        <div className="flex h-10 items-center border-b border-border px-4 font-mono text-xs text-muted-foreground">{title}</div>
      ) : null}
      <CopyButton value={code} className="absolute right-2 top-1.5 z-10 bg-surface-2/80 backdrop-blur" />
      <div
        className="overflow-auto py-4 pl-4 pr-12 font-mono text-[13px] leading-6 [&_pre]:outline-none"
        style={maxHeight ? { maxHeight } : undefined}
        // Shiki output is generated at build time from our own source files.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
