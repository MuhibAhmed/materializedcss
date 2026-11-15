"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Range } from "@/components/ui/range";

export function RangeControlled() {
  const [temperature, setTemperature] = React.useState([21]);

  return (
    <div className="w-full max-w-md space-y-6 pt-8">
      <Range
        aria-label="Temperature"
        value={temperature}
        onValueChange={setTemperature}
        min={10}
        max={30}
        step={0.5}
        formatValue={(value) => `${value}°`}
        getAriaValueText={(value) => `${value} degrees Celsius`}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="flat" onClick={() => setTemperature([18])}>
          Eco (18°)
        </Button>
        <Button variant="flat" onClick={() => setTemperature([23])}>
          Comfort (23°)
        </Button>
        <span className="ml-auto whitespace-nowrap text-sm text-muted-foreground">Current: {temperature[0]}°C</span>
      </div>
    </div>
  );
}
