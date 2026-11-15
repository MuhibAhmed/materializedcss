import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarLink,
  NavbarMenuButton,
  NavbarNav,
} from "@/components/ui/navbar";

export function NavbarBrandPosition() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Navbar>
        <NavbarContent>
          <NavbarMenuButton aria-expanded={false} />
          <NavbarBrand href="#" position="center">
            Logo
          </NavbarBrand>
        </NavbarContent>
      </Navbar>
      <Navbar>
        <NavbarContent>
          <NavbarBrand href="#" position="right">
            Logo
          </NavbarBrand>
          <NavbarNav aria-label="Secondary" align="start">
            <NavbarItem>
              <NavbarLink href="#">Sass</NavbarLink>
            </NavbarItem>
            <NavbarItem>
              <NavbarLink href="#">Components</NavbarLink>
            </NavbarItem>
          </NavbarNav>
        </NavbarContent>
      </Navbar>
    </div>
  );
}
