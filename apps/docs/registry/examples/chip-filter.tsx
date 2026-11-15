"use client";

import * as React from "react";

import { Chip } from "@/components/ui/chip";

const sizes = ["Small", "Medium", "Large", "X-Large"];

export function ChipFilter() {
  const [selected, setSelected] = React.useState<string[]>(["Medium"]);

  return (
    <div role="group" aria-label="Sizes" className="flex flex-wrap justify-center gap-2">
      {sizes.map((size) => {
        const on = selected.includes(size);
        return (
          <Chip key={size} asChild selected={on}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => setSelected((current) => (on ? current.filter((s) => s !== size) : [...current, size]))}
            >
              {size}
            </button>
          </Chip>
        );
      })}
    </div>
  );
}
