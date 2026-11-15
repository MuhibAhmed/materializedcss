"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RadioGroupControlled() {
  const [plan, setPlan] = React.useState("monthly");

  return (
    <div className="flex flex-col items-start gap-4">
      <RadioGroup value={plan} onValueChange={setPlan} aria-label="Billing">
        <RadioGroupItem value="monthly" label="Monthly" />
        <RadioGroupItem value="yearly" label="Yearly" />
      </RadioGroup>
      <span className="text-sm text-muted-foreground">Selected plan: {plan}</span>
      <Button variant="flat" onClick={() => setPlan("yearly")}>
        Switch to yearly
      </Button>
    </div>
  );
}
