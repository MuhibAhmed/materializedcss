import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDropDownIcon } from "@/components/ui/icons";

export function DropdownMenuBelow() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outlined" color="secondary" className="w-48 justify-between">
            Sort by
            <ArrowDropDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent coverTrigger={false} constrainWidth>
          <DropdownMenuItem>Newest</DropdownMenuItem>
          <DropdownMenuItem>Oldest</DropdownMenuItem>
          <DropdownMenuItem>Name</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="flat">Align end</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent coverTrigger={false} align="end">
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
