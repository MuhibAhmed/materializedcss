"use client";

import { Range } from "@/components/ui/range";

export function RangeStep() {
  return (
    <div className="w-full max-w-md space-y-10 pt-8">
      <Range aria-label="Rating" defaultValue={[3]} min={1} max={5} step={1} valueLabel="always" />
      <Range aria-label="Brightness" defaultValue={[30]} step={10} formatValue={(value) => `${value}%`} />
    </div>
  );
}
