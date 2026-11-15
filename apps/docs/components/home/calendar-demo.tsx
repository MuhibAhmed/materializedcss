"use client";

import * as React from "react";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";

/** Inline calendar with a selected day read back below it. */
export function CalendarDemo(): React.JSX.Element {
  const [date, setDate] = React.useState<Date | null>(null);

  return (
    <Card className="overflow-hidden">
      <div className="flex justify-center bg-surface py-2">
        <Calendar locale="en-US" value={date} onValueChange={setDate} />
      </div>
      <CardContent className="border-t border-border py-3 text-sm text-muted-foreground">
        Selected: <output className="text-foreground">{date ? date.toDateString() : "none"}</output>
      </CardContent>
    </Card>
  );
}
