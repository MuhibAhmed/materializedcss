"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertIcon } from "@/components/ui/icons";

export function DropdownMenuAdvanced() {
  const [wrap, setWrap] = React.useState(true);
  const [minimap, setMinimap] = React.useState(false);
  const [density, setDensity] = React.useState("comfortable");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="floating" color="secondary" aria-label="View options">
          <MoreVertIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent coverTrigger={false} className="w-64">
        <DropdownMenuItem>
          New file
          <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email link</DropdownMenuItem>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuLabel inset>View</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={wrap} onCheckedChange={setWrap}>
          Word wrap
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={minimap} onCheckedChange={setMinimap}>
          Minimap
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel inset>Density</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
          <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive>
          Delete
          <DropdownMenuShortcut>Del</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
