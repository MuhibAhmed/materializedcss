import { Heading, Lead, Muted } from "@/components/ui/typography";

export function TypographyText() {
  return (
    <article className="max-w-xl space-y-3">
      <Heading level={2} size="h4" spacing="none">
        Release notes
      </Heading>
      <Lead>Version 2.0 brings dark mode, server components and a new CLI.</Lead>
      <p className="leading-relaxed">
        Body text uses Roboto at 15px with a comfortable line height. <strong>Bold</strong>, <em>italic</em> and{" "}
        <span className="font-light">light (300)</span> weights are available.
      </p>
      <Muted>Published November 2026</Muted>
    </article>
  );
}
