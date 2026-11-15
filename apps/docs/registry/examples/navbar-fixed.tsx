import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarLink, NavbarNav } from "@/components/ui/navbar";

export function NavbarFixed() {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Scrollable page with a fixed navbar"
      className="h-80 w-full overflow-y-auto bg-background outline-none focus-visible:focus-ring"
    >
      <Navbar fixed>
        <NavbarContent>
          <NavbarBrand href="#">Logo</NavbarBrand>
          <NavbarNav aria-label="Fixed">
            <NavbarItem>
              <NavbarLink href="#">Sass</NavbarLink>
            </NavbarItem>
            <NavbarItem>
              <NavbarLink href="#">Components</NavbarLink>
            </NavbarItem>
          </NavbarNav>
        </NavbarContent>
      </Navbar>
      <div className="space-y-4 p-6 text-muted-foreground">
        {Array.from({ length: 8 }, (_, index) => (
          <p key={index}>
            Scroll this area: the navbar sticks to the top. Fixed navbars use position: sticky, so they keep their space
            in the layout and never cover the content below.
          </p>
        ))}
      </div>
    </div>
  );
}
