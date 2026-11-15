"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxForm() {
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      }}
    >
      <Checkbox name="newsletter" value="yes" label="Subscribe to the newsletter" defaultChecked />
      <Checkbox name="terms" value="accepted" label="I accept the terms" required />
      <div>
        <Button type="submit">Submit</Button>
      </div>
      <output aria-label="Submitted values" className="block font-mono text-sm text-muted-foreground">
        {submitted}
      </output>
    </form>
  );
}
