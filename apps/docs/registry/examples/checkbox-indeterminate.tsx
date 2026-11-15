"use client";

import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";

const toppings = ["Cheese", "Mushrooms", "Olives"];

export function CheckboxIndeterminate() {
  const [selected, setSelected] = React.useState<string[]>(["Cheese"]);
  const all = selected.length === toppings.length ? true : selected.length === 0 ? false : "indeterminate";

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        label="All toppings"
        checked={all}
        onCheckedChange={(checked) => setSelected(checked === true ? toppings : [])}
      />
      <div className="flex flex-col gap-3 pl-9">
        {toppings.map((topping) => (
          <Checkbox
            key={topping}
            label={topping}
            checked={selected.includes(topping)}
            onCheckedChange={(checked) =>
              setSelected((prev) => (checked === true ? [...prev, topping] : prev.filter((item) => item !== topping)))
            }
          />
        ))}
      </div>
    </div>
  );
}
