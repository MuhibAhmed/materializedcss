import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DropdownMenuOverflow() {
  return (
    <div className="h-24 w-64 overflow-hidden rounded-md border border-border p-4">
      <p className="mb-2 text-sm text-muted-foreground">overflow: hidden</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem>Move to…</DropdownMenuItem>
          <DropdownMenuItem>Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
