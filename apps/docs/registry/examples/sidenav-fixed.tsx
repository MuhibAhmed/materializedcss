import { Button } from "@/components/ui/button";
import { MaterialIcon, MenuIcon } from "@/components/ui/icons";
import { Sidenav, SidenavContent, SidenavItem, SidenavSubheader, SidenavTrigger } from "@/components/ui/sidenav";

export function SidenavFixed() {
  return (
    <div className="flex h-[360px] w-full overflow-hidden rounded-md border border-border">
      <Sidenav>
        <SidenavContent label="Dashboard navigation" variant="fixed" breakpoint="lg">
          <SidenavSubheader>Dashboard</SidenavSubheader>
          <SidenavItem href="#overview" icon={<MaterialIcon name="dashboard" />} active>
            Overview
          </SidenavItem>
          <SidenavItem href="#reports" icon={<MaterialIcon name="insert_chart" />}>
            Reports
          </SidenavItem>
          <SidenavItem href="#team" icon={<MaterialIcon name="people" />}>
            Team
          </SidenavItem>
        </SidenavContent>
        <main className="flex-1 p-6">
          <SidenavTrigger asChild>
            <Button variant="flat" className="lg:hidden">
              <MenuIcon />
              Menu
            </Button>
          </SidenavTrigger>
          <p className="mt-2 text-muted-foreground">
            From the <code>lg</code> breakpoint up the sidenav is always visible. Below it, the menu button opens it as a
            drawer.
          </p>
        </main>
      </Sidenav>
    </div>
  );
}
