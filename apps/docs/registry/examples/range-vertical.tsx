import { Range } from "@/components/ui/range";

export function RangeVertical() {
  return (
    <div className="flex gap-16 pl-10">
      <Range orientation="vertical" aria-label="Bass" defaultValue={[60]} />
      <Range orientation="vertical" aria-label="Treble" defaultValue={[30]} />
      <Range orientation="vertical" aria-label="Band" defaultValue={[25, 75]} />
    </div>
  );
}
