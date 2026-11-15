"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Datepicker } from "@/components/ui/datepicker";

export function DatepickerControlled() {
  const [date, setDate] = React.useState<Date | null>(new Date(2026, 10, 15));
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Datepicker label="Start date" locale="en-US" value={date} onValueChange={setDate} open={open} onOpenChange={setOpen} />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setDate(new Date())}>Today</Button>
        <Button size="sm" variant="outlined" onClick={() => setOpen(true)}>Open</Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Value: <output aria-label="Controlled value">{date ? date.toDateString() : "null"}</output> · open:{" "}
        {String(open)}
      </p>
    </div>
  );
}
