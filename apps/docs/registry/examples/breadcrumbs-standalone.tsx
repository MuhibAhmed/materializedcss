import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumbs,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumbs";
import { MaterialIcon } from "@/components/ui/icons";

export function BreadcrumbsStandalone() {
  return (
    <Breadcrumbs aria-label="Breadcrumb (files)" className="text-base">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#" className="text-link">
            <MaterialIcon name="home" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#" className="text-link">
            Documents
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Report.pdf</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumbs>
  );
}
