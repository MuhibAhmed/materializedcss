import { Heading } from "@/components/ui/typography";

// The page already has an <h1>, so the demo starts at level 2 and uses `size`
// to show the full h1–h6 scale without breaking the document outline.
export function TypographyHeadings() {
  return (
    <div className="w-full">
      <Heading level={2} size="h1" spacing="none">
        Heading h1
      </Heading>
      <Heading level={3} size="h2">
        Heading h2
      </Heading>
      <Heading level={4} size="h3">
        Heading h3
      </Heading>
      <Heading level={5} size="h4">
        Heading h4
      </Heading>
      <Heading level={6} size="h5">
        Heading h5
      </Heading>
      <Heading level={6} size="h6">
        Heading h6
      </Heading>
    </div>
  );
}
