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
    // `[&+p]:mt-4` spaces a paragraph that directly follows the block (prose margins are only between paragraphs).
    <div className={cn("group relative overflow-hidden rounded-md border border-border bg-surface-2 [&+p]:mt-4", className)}>
      {title ? (
        <div className="flex h-10 items-center border-b border-border px-4 font-mono text-xs text-muted-foreground">{title}</div>
      ) : null}
      {/* Opaque backing up to the edge, so code that scrolls sideways never shows around the button. */}
      <div className="absolute right-0 top-0 z-10 rounded-bl-md bg-surface-2 py-[3px] pr-2 pl-1">
        <CopyButton value={code} />
      </div>
      <div
        className="overflow-auto py-4 pl-4 pr-12 font-mono text-[13px] leading-6 [&_pre]:outline-none"
        style={maxHeight ? { maxHeight } : undefined}
        // Shiki output is generated at build time from our own source files.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
