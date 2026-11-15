import { Badge } from "@/components/ui/badge";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarLink, NavbarNav } from "@/components/ui/navbar";

export function BadgeNavbar() {
  return (
    <Navbar>
      <NavbarContent>
        <NavbarBrand href="#">Logo</NavbarBrand>
        <NavbarNav aria-label="Inbox">
          <NavbarItem>
            <NavbarLink href="#">
              Inbox
              <Badge variant="new">4</Badge>
            </NavbarLink>
          </NavbarItem>
          <NavbarItem>
            <NavbarLink href="#">
              Drafts
              <Badge className="text-inherit">2</Badge>
            </NavbarLink>
          </NavbarItem>
        </NavbarNav>
      </NavbarContent>
    </Navbar>
  );
}
