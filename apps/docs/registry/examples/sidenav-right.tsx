import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/icons";
import { Sidenav, SidenavClose, SidenavContent, SidenavItem, SidenavSubheader, SidenavTrigger } from "@/components/ui/sidenav";

export function SidenavRight() {
  return (
    <Sidenav edge="right">
      <SidenavTrigger asChild>
        <Button variant="outlined" color="secondary">
          Filters
        </Button>
      </SidenavTrigger>
      <SidenavContent label="Filters" closeOnClick>
        <SidenavSubheader>Sort by</SidenavSubheader>
        <SidenavItem href="#newest" icon={<MaterialIcon name="schedule" />}>
          Newest
        </SidenavItem>
        <SidenavItem href="#popular" icon={<MaterialIcon name="trending_up" />}>
          Most popular
        </SidenavItem>
        <li className="px-8 pt-4">
          <SidenavClose asChild>
            <Button className="w-full">Done</Button>
          </SidenavClose>
        </li>
      </SidenavContent>
    </Sidenav>
  );
}
