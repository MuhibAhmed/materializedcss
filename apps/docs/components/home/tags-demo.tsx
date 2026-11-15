"use client";

import * as React from "react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ChipsInput } from "@/components/ui/chips-input";

const SUGGESTIONS = ["React", "Tailwind", "TypeScript", "Radix", "Next.js", "Vite", "Material Design"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

/** Chips input with suggestions, plus a group of filter chips. */
export function TagsDemo(): React.JSX.Element {
  const [level, setLevel] = React.useState("Intermediate");
  const levelId = React.useId();

  return (
    <Card>
      <CardContent>
        <CardTitle>New post</CardTitle>
        <ChipsInput
          label="Tags"
          defaultValue={["React", "Tailwind"]}
          suggestions={SUGGESTIONS}
          placeholder="Add a tag"
          secondaryPlaceholder="+Tag"
          helperText="Press Enter to add, Backspace to remove"
          limit={6}
        />
        <p id={levelId} className="mb-2! mt-4! text-sm text-muted-foreground">
          Level
        </p>
        <div role="group" aria-labelledby={levelId} className="flex flex-wrap gap-2">
          {LEVELS.map((item) => {
            const on = item === level;
            return (
              <Chip key={item} asChild selected={on}>
                <button type="button" aria-pressed={on} onClick={() => setLevel(item)}>
                  {item}
                </button>
              </Chip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
