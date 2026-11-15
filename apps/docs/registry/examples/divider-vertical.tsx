import { Divider } from "@/components/ui/divider";

export function DividerVertical() {
  return (
    <div className="flex h-6 items-center gap-4 text-sm text-foreground">
      <span>Blog</span>
      <Divider orientation="vertical" decorative />
      <span>Docs</span>
      <Divider orientation="vertical" decorative />
      <span>Source</span>
    </div>
  );
}
