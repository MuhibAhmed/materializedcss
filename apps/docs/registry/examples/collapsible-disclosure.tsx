"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  CollapsibleSection,
  CollapsibleSectionContent,
  CollapsibleSectionTrigger,
} from "@/components/ui/collapsible";

export function CollapsibleDisclosure() {
  const [open, setOpen] = React.useState(false);

  return (
    <CollapsibleSection open={open} onOpenChange={setOpen} className="w-full max-w-2xl">
      <CollapsibleSectionTrigger asChild>
        <Button variant="flat" color="secondary">
          {open ? "Hide" : "Show"} advanced options
        </Button>
      </CollapsibleSectionTrigger>
      <CollapsibleSectionContent>
        <div className="mt-3 rounded-ui border border-border p-6 text-sm">
          Cache size, proxy settings and experimental features.
        </div>
      </CollapsibleSectionContent>
    </CollapsibleSection>
  );
}
