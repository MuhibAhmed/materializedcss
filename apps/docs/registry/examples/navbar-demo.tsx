import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarLink, NavbarNav } from "@/components/ui/navbar";

export function NavbarDemo() {
  return (
    <Navbar>
      <NavbarContent>
        <NavbarBrand href="#">Logo</NavbarBrand>
        <NavbarNav aria-label="Main">
          <NavbarItem>
            <NavbarLink href="#">Sass</NavbarLink>
          </NavbarItem>
          <NavbarItem>
            <NavbarLink href="#" active>
              Components
            </NavbarLink>
          </NavbarItem>
          <NavbarItem>
            <NavbarLink href="#">JavaScript</NavbarLink>
          </NavbarItem>
        </NavbarNav>
      </NavbarContent>
    </Navbar>
  );
}
