"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

export function TextFieldPrefilled() {
  const [city, setCity] = React.useState("");

  return (
    <div className="w-full max-w-md">
      <TextField label="City" value={city} onChange={(event) => setCity(event.target.value)} autoComplete="address-level2" />
      <TextField label="Start date" type="date" />
      <TextField label="Search" placeholder="Try a city name" />
      <div className="flex gap-3">
        <Button onClick={() => setCity("Amsterdam")}>Fill city</Button>
        <Button variant="flat" onClick={() => setCity("")}>
          Clear
        </Button>
      </div>
    </div>
  );
}
