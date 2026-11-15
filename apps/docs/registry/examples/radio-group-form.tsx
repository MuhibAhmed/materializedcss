"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RadioGroupForm() {
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      }}
    >
      <RadioGroup name="delivery" required aria-label="Delivery">
        <RadioGroupItem value="home" label="Home delivery" />
        <RadioGroupItem value="office" label="Office" />
      </RadioGroup>
      <div>
        <Button type="submit">Submit</Button>
      </div>
      <output aria-label="Submitted values" className="block font-mono text-sm text-muted-foreground">
        {submitted}
      </output>
    </form>
  );
}
