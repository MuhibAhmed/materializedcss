"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";

export function SelectControlled() {
  const [fruit, setFruit] = React.useState("apple");

  return (
    <div className="w-full max-w-sm">
      <Select label="Fruit" value={fruit} onValueChange={setFruit}>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
      </Select>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={() => setFruit("cherry")}>
          Pick cherry
        </Button>
        <Button size="sm" variant="flat" onClick={() => setFruit("")}>
          Clear
        </Button>
        <span className="text-sm text-muted-foreground">Value: {fruit || "(none)"}</span>
      </div>
    </div>
  );
}
