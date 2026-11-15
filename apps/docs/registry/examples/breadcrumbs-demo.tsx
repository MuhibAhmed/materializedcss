import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumbs,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumbs";
import { Navbar, NavbarContent } from "@/components/ui/navbar";

export function BreadcrumbsDemo() {
  return (
    <Navbar>
      <NavbarContent>
        <Breadcrumbs className="px-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">First</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Second</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Third</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumbs>
      </NavbarContent>
    </Navbar>
  );
}
