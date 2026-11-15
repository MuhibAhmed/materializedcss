import { Chip } from "@/components/ui/chip";

const avatar =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#00897b"/><text x="16" y="21" font-family="sans-serif" font-size="14" fill="white" text-anchor="middle">JD</text></svg>',
  );

export function ChipDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Chip>Tag</Chip>
      <Chip image={avatar} imageAlt="">
        Jane Doe
      </Chip>
      <Chip selected>Selected</Chip>
      <Chip disabled>Disabled</Chip>
    </div>
  );
}
