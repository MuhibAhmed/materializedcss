import { Range } from "@/components/ui/range";

export function RangeDemo() {
  return (
    <div className="w-full max-w-md space-y-3 pt-8">
      <span id="range-demo-label" className="text-sm text-muted-foreground">
        Volume
      </span>
      <Range aria-labelledby="range-demo-label" defaultValue={[40]} />
    </div>
  );
}
