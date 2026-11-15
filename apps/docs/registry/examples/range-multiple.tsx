"use client";

import * as React from "react";

import { Range } from "@/components/ui/range";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function RangeMultiple() {
  const [price, setPrice] = React.useState([200, 600]);

  return (
    <div className="w-full max-w-md space-y-3 pt-8">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span id="price-label">Price</span>
        <span aria-live="polite">
          {currency.format(price[0] ?? 0)} – {currency.format(price[1] ?? 0)}
        </span>
      </div>
      <Range
        aria-labelledby="price-label"
        value={price}
        onValueChange={setPrice}
        min={0}
        max={1000}
        step={10}
        minStepsBetweenThumbs={5}
        formatValue={(value) => `$${value}`}
        getAriaValueText={(value) => currency.format(value)}
      />
    </div>
  );
}
