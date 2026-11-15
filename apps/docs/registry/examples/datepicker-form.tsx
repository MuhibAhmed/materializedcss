"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Datepicker } from "@/components/ui/datepicker";

export function DatepickerForm() {
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form
      className="w-full max-w-xs"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(JSON.stringify(Object.fromEntries(data)));
      }}
    >
      <Datepicker label="Arrival" name="arrival" locale="en-US" defaultValue={new Date(2026, 11, 24)} />
      <Datepicker label="Departure" name="departure" locale="en-US" autoClose />
      <Button type="submit" className="mt-2">
        Book
      </Button>
      <output aria-label="Submitted values" className="mt-4 block font-mono text-sm text-muted-foreground">
        {submitted}
      </output>
    </form>
  );
}
