"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

export function TextFieldForm() {
  const [submitted, setSubmitted] = React.useState<string>("");

  return (
    <form
      className="w-full max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      }}
    >
      <TextField label="Name" name="name" required />
      <TextField label="Age" name="age" type="number" min={0} max={130} />
      <div className="flex gap-3">
        <Button type="submit">Submit</Button>
        <Button type="reset" variant="flat">
          Reset
        </Button>
      </div>
      <output aria-label="Submitted values" className="mt-4 block font-mono text-sm text-muted-foreground">
        {submitted}
      </output>
    </form>
  );
}
