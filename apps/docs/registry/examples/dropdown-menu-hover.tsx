import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DropdownMenuHover() {
  return (
    <DropdownMenu hover>
      <DropdownMenuTrigger asChild>
        <Button variant="flat" color="secondary">
          Hover me
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent coverTrigger={false}>
        <DropdownMenuItem>Documents</DropdownMenuItem>
        <DropdownMenuItem>Photos</DropdownMenuItem>
        <DropdownMenuItem>Music</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
