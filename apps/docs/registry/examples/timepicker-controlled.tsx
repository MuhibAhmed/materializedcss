"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Timepicker } from "@/components/ui/timepicker";

export function TimepickerControlled() {
  const [time, setTime] = React.useState<string | null>("07:00");

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Timepicker label="Wake up" locale="en-US" value={time} onValueChange={setTime} />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setTime("06:30")}>6:30</Button>
        <Button size="sm" variant="outlined" onClick={() => setTime(null)}>Reset</Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Value: <output aria-label="Controlled value">{time ?? "null"}</output>
      </p>
    </div>
  );
}
