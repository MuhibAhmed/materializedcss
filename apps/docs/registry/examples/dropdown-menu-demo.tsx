import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MaterialIcon } from "@/components/ui/icons";

export function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Drop me!</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>one</DropdownMenuItem>
        <DropdownMenuItem>two</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>three</DropdownMenuItem>
        <DropdownMenuItem>
          <MaterialIcon name="view_module" />
          four
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MaterialIcon name="cloud" />
          five
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
