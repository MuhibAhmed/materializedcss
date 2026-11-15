import { Range } from "@/components/ui/range";

export function RangeDisabled() {
  return (
    <div className="w-full max-w-md">
      <Range aria-label="Locked setting" defaultValue={[60]} disabled />
    </div>
  );
}
