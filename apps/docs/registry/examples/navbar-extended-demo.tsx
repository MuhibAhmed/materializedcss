import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/icons";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarExtended,
  NavbarItem,
  NavbarLink,
  NavbarNav,
  NavbarTitle,
} from "@/components/ui/navbar";

export function NavbarExtendedDemo() {
  return (
    <Navbar>
      <NavbarContent>
        <NavbarBrand href="#">Logo</NavbarBrand>
        <NavbarNav aria-label="Site">
          <NavbarItem>
            <NavbarLink href="#">Sass</NavbarLink>
          </NavbarItem>
          <NavbarItem>
            <NavbarLink href="#">Components</NavbarLink>
          </NavbarItem>
        </NavbarNav>
      </NavbarContent>
      <NavbarExtended>
        <NavbarTitle as="h2">Title</NavbarTitle>
        <Button variant="floating" size="lg" aria-label="Add" className="absolute right-6 -bottom-7">
          <MaterialIcon name="add" />
        </Button>
      </NavbarExtended>
    </Navbar>
  );
}
