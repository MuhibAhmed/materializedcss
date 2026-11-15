"use client";

import * as React from "react";

import { Autocomplete } from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";

const languages = ["JavaScript", "Java", "Julia", "Kotlin", "Python", "Ruby", "Rust", "Scala", "Swift", "TypeScript"];

export function AutocompleteControlled() {
  const [value, setValue] = React.useState("");
  const [chosen, setChosen] = React.useState<string | null>(null);

  return (
    <div className="w-full max-w-md">
      <Autocomplete
        label="Language"
        options={languages.map((language) => ({ value: language }))}
        limit={3}
        minLength={2}
        value={value}
        onValueChange={setValue}
        onAutocomplete={(option) => setChosen(option.value)}
        helperText="Type at least 2 characters; shows up to 3 matches"
      />
      <div className="flex items-center gap-3">
        <Button onClick={() => setValue("TypeScript")}>Set TypeScript</Button>
        <span className="text-sm text-muted-foreground">Chosen: {chosen ?? "none"}</span>
      </div>
    </div>
  );
}
