"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Range } from "@/components/ui/range";

export function RangeForm() {
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form
      className="w-full max-w-md space-y-6 pt-8"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(JSON.stringify({ volume: data.get("volume"), age: data.getAll("age[]") }));
      }}
    >
      <Range name="volume" aria-label="Volume" defaultValue={[70]} />
      <Range name="age" aria-label="Age" defaultValue={[18, 65]} max={120} />
      <Button type="submit">Submit</Button>
      <output aria-label="Submitted values" className="block font-mono text-sm text-muted-foreground">
        {submitted}
      </output>
    </form>
  );
}
