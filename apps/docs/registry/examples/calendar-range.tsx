"use client";

import * as React from "react";

import { Calendar, type DateRange } from "@/components/ui/calendar";

export function CalendarRange() {
  const [range, setRange] = React.useState<DateRange>({ from: null, to: null });
  const format = (date: Date | null) => (date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "…");

  return (
    <div className="flex flex-col items-center gap-3">
      <Calendar locale="en-US" mode="range" value={range} onValueChange={setRange} className="rounded-ui shadow-z1" />
      <p className="text-sm text-muted-foreground">
        Trip: <output>{range.from ? `${format(range.from)} – ${format(range.to)}` : "pick a start day"}</output>
      </p>
    </div>
  );
}
