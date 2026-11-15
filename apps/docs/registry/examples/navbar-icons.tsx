import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/icons";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarLink, NavbarNav } from "@/components/ui/navbar";

export function NavbarIcons() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Navbar>
        <NavbarContent>
          <NavbarBrand href="#">
            <MaterialIcon name="cloud" />
            Logo
          </NavbarBrand>
          <NavbarNav aria-label="Tools">
            <NavbarItem>
              <NavbarLink href="#" aria-label="Search">
                <MaterialIcon name="search" />
              </NavbarLink>
            </NavbarItem>
            <NavbarItem>
              <NavbarLink href="#" aria-label="Apps">
                <MaterialIcon name="view_module" />
              </NavbarLink>
            </NavbarItem>
            <NavbarItem>
              <NavbarLink href="#" aria-label="Refresh">
                <MaterialIcon name="refresh" />
              </NavbarLink>
            </NavbarItem>
          </NavbarNav>
        </NavbarContent>
      </Navbar>
      <Navbar>
        <NavbarContent>
          <NavbarBrand href="#">Logo</NavbarBrand>
          <NavbarNav aria-label="Actions">
            <NavbarItem>
              <NavbarLink href="#">
                <MaterialIcon name="view_module" />
                Grid
              </NavbarLink>
            </NavbarItem>
            <NavbarItem>
              <Button color="secondary">Sign up</Button>
            </NavbarItem>
          </NavbarNav>
        </NavbarContent>
      </Navbar>
    </div>
  );
}
