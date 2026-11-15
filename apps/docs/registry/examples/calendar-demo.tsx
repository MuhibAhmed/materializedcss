"use client";

import * as React from "react";

import { Calendar } from "@/components/ui/calendar";

export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | null>(new Date());

  return (
    <div className="flex flex-col items-center gap-3">
      <Calendar locale="en-US" value={date} onValueChange={setDate} className="rounded-ui shadow-z1" />
      <p className="text-sm text-muted-foreground">
        Selected: <output>{date ? date.toDateString() : "none"}</output>
      </p>
    </div>
  );
}
