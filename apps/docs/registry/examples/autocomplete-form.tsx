"use client";

import * as React from "react";

import { Autocomplete } from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";

const frameworks = ["Angular", "Astro", "Next.js", "Nuxt", "React", "Remix", "Solid", "Svelte", "Vue"];

export function AutocompleteForm() {
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form
      className="w-full max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      }}
    >
      <Autocomplete label="Framework" name="framework" required options={frameworks.map((value) => ({ value }))} />
      <Button type="submit">Submit</Button>
      <output aria-label="Submitted values" className="mt-4 block font-mono text-sm text-muted-foreground">
        {submitted}
      </output>
    </form>
  );
}
