"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { ChipsInput } from "@/components/ui/chips-input";

export function ChipsInputForm() {
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form
      className="w-full max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify({ skills: new FormData(event.currentTarget).getAll("skills") }));
      }}
    >
      <ChipsInput label="Skills" name="skills" required />
      <Button type="submit">Save</Button>
      <output aria-label="Submitted values" className="mt-4 block font-mono text-sm text-muted-foreground">
        {submitted}
      </output>
    </form>
  );
}
