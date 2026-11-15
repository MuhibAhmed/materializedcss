"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TextareaForm() {
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form
      className="w-full max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      }}
    >
      <Textarea label="Feedback" name="feedback" required maxLength={200} showCount />
      <Button type="submit">Send</Button>
      <output aria-label="Submitted values" className="mt-4 block font-mono text-sm text-muted-foreground">
        {submitted}
      </output>
    </form>
  );
}
