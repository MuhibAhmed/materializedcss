import { CodeBlock } from "~/components/docs/code-block";
import { SimpleTabs } from "~/components/docs/simple-tabs";
import { readExampleSource } from "~/lib/registry";
import { cn } from "@/lib/utils";

export interface ComponentPreviewProps {
  /** Example file name in registry/examples (without .tsx). Its source is shown in the Code tab. */
  name: string;
  /** The rendered example. */
  children: React.ReactNode;
  className?: string;
  /** Alignment of the example inside the preview pane. */
  align?: "center" | "start";
  /** Remove the preview padding (full-bleed examples such as navbars). */
  bleed?: boolean;
}

/** Preview / Code tabs for a live example, like shadcn's component previews. */
export async function ComponentPreview({
  name,
  children,
  className,
  align = "center",
  bleed = false,
}: ComponentPreviewProps): Promise<React.JSX.Element> {
  const source = readExampleSource(name);

  return (
    <SimpleTabs
      label={`${name} example`}
      className="my-6"
      tabs={[
        {
          value: "preview",
          label: "Preview",
          content: (
            <div
              data-preview={name}
              className={cn(
                "relative flex min-h-[320px] w-full rounded-md border border-border bg-background",
                align === "center" ? "items-center justify-center" : "items-start justify-start",
                bleed ? "overflow-hidden p-0" : "p-6 sm:p-10",
                className,
              )}
            >
              {children}
            </div>
          ),
        },
        { value: "code", label: "Code", content: <CodeBlock code={source} maxHeight={520} /> },
      ]}
    />
  );
}
