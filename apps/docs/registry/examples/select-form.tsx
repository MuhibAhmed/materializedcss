"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { MultiSelect, NativeSelect, Select, SelectItem } from "@/components/ui/select";

export function SelectForm() {
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form
      className="w-full max-w-sm"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(JSON.stringify({ plan: data.get("plan"), billing: data.get("billing"), extras: data.getAll("extras") }));
      }}
    >
      <Select label="Plan" name="plan" required defaultValue="pro">
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
        <SelectItem value="team">Team</SelectItem>
      </Select>
      <NativeSelect label="Billing" name="billing" defaultValue="yearly">
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </NativeSelect>
      <MultiSelect
        label="Extras"
        name="extras"
        defaultValue={["backup"]}
        options={[
          { value: "backup", label: "Backups" },
          { value: "support", label: "Priority support" },
          { value: "sso", label: "Single sign-on" },
        ]}
      />
      <Button type="submit">Submit</Button>
      <output aria-label="Submitted values" className="mt-4 block font-mono text-sm text-muted-foreground">
        {submitted}
      </output>
    </form>
  );
}
