"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function SwitchForm() {
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form
      className="flex flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      }}
    >
      <Switch name="darkMode" value="enabled" label="Dark mode" defaultChecked />
      <Switch name="beta" value="enabled" label="Beta features" />
      <Button type="submit">Submit</Button>
      <output aria-label="Submitted values" className="block font-mono text-sm text-muted-foreground">
        {submitted}
      </output>
    </form>
  );
}
