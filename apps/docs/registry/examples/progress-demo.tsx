"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function ProgressDemo() {
  const [value, setValue] = React.useState(70);
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Progress value={value} label="Upload progress" />
      <div className="flex items-center justify-between gap-4">
        <Button variant="flat" onClick={() => setValue((v) => Math.max(0, v - 10))}>
          Less
        </Button>
        <span className="text-sm text-muted-foreground tabular-nums">{value}%</span>
        <Button variant="flat" onClick={() => setValue((v) => Math.min(100, v + 10))}>
          More
        </Button>
      </div>
    </div>
  );
}
