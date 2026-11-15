"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleBody, CollapsibleHeader, CollapsibleItem } from "@/components/ui/collapsible";

const steps = ["Account", "Profile", "Confirm"];

export function CollapsibleControlled() {
  const [open, setOpen] = React.useState("Account");
  const index = steps.indexOf(open);

  return (
    <div className="w-full max-w-2xl">
      <Collapsible value={open} onValueChange={setOpen}>
        {steps.map((step, i) => (
          <CollapsibleItem key={step} value={step}>
            <CollapsibleHeader>
              Step {i + 1}: {step}
            </CollapsibleHeader>
            <CollapsibleBody>Fill in your {step.toLowerCase()} details.</CollapsibleBody>
          </CollapsibleItem>
        ))}
      </Collapsible>
      <div className="mt-4 flex gap-2">
        <Button variant="flat" disabled={index <= 0} onClick={() => setOpen(steps[index - 1] ?? "")}>
          Back
        </Button>
        <Button disabled={index === steps.length - 1} onClick={() => setOpen(steps[index + 1] ?? steps[0] ?? "")}>
          Next step
        </Button>
      </div>
    </div>
  );
}
