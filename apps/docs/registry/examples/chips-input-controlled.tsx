"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { ChipsInput, chipTag, type ChipsInputChip } from "@/components/ui/chips-input";

export function ChipsInputControlled() {
  const [recipients, setRecipients] = React.useState<ChipsInputChip[]>([]);
  const [log, setLog] = React.useState("");

  return (
    <div className="w-full max-w-md">
      <ChipsInput
        label="Recipients"
        variant="outlined"
        value={recipients}
        onValueChange={setRecipients}
        onAdd={(chip) => setLog(`Added ${chipTag(chip)}`)}
        onDelete={(chip) => setLog(`Removed ${chipTag(chip)}`)}
        error={recipients.length > 3 ? "Too many recipients (max 3)" : undefined}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setRecipients(["ada@example.com", "grace@example.com"])}>Load team</Button>
        <Button variant="flat" onClick={() => setRecipients([])}>
          Clear
        </Button>
        <span className="text-sm text-muted-foreground">{log}</span>
      </div>
    </div>
  );
}
