"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const QUOTE =
  "Material is the metaphor. A material metaphor is the unifying theory of a rationalized space and a system of motion.";

export function TextareaControlled() {
  const [notes, setNotes] = React.useState("");

  return (
    <div className="w-full max-w-md">
      <Textarea
        label="Notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        error={notes.length > 0 && notes.length < 10 ? "Write at least 10 characters" : undefined}
      />
      <div className="flex gap-3">
        <Button onClick={() => setNotes(QUOTE)}>Insert quote</Button>
        <Button variant="flat" onClick={() => setNotes("")}>
          Clear
        </Button>
      </div>
    </div>
  );
}
