"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Datepicker } from "@/components/ui/datepicker";
import { Timepicker } from "@/components/ui/timepicker";

export function TimepickerForm() {
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form
      className="w-full max-w-xs"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      }}
    >
      <Datepicker label="Date" name="date" locale="en-US" defaultValue={new Date(2026, 10, 20)} />
      <Timepicker label="Time" name="time" locale="en-US" defaultValue="19:30" autoClose />
      <Button type="submit" className="mt-2">
        Reserve
      </Button>
      <output aria-label="Submitted values" className="mt-4 block font-mono text-sm text-muted-foreground">
        {submitted}
      </output>
    </form>
  );
}
