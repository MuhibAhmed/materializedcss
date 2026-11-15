"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

const initial = ["Design", "Engineering", "Marketing", "Sales"];

export function ChipDeletable() {
  const [tags, setTags] = React.useState(initial);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        {tags.map((tag) => (
          <Chip key={tag} onDelete={() => setTags((current) => current.filter((t) => t !== tag))}>
            {tag}
          </Chip>
        ))}
      </div>
      {tags.length < initial.length ? (
        <Button variant="flat" onClick={() => setTags(initial)}>
          Restore
        </Button>
      ) : null}
    </div>
  );
}
