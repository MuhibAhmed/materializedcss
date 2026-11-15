"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { AddIcon } from "@/components/ui/icons";
import {
  TapTarget,
  TapTargetAnchor,
  TapTargetContent,
  TapTargetDescription,
  TapTargetTitle,
} from "@/components/ui/tap-target";

export function TapTargetDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <TapTarget open={open} onOpenChange={setOpen}>
      <div className="flex w-full items-center justify-between gap-4">
        <Button onClick={() => setOpen(true)}>Open tap target</Button>
        <TapTargetAnchor>
          <Button variant="floating" size="lg" color="error" aria-label="Add item">
            <AddIcon />
          </Button>
        </TapTargetAnchor>
      </div>
      <TapTargetContent>
        <TapTargetTitle>Add new items</TapTargetTitle>
        <TapTargetDescription>
          Use the plus button to start a new list item. Everything you add is saved as you type.
        </TapTargetDescription>
        <Button variant="flat" className="-mx-4 mt-3 text-primary-foreground" onClick={() => setOpen(false)}>
          Got it
        </Button>
      </TapTargetContent>
    </TapTarget>
  );
}
