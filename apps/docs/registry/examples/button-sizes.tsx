import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/icons";

export function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button variant="floating" size="sm" aria-label="Edit">
        <MaterialIcon name="edit" />
      </Button>
      <Button variant="floating" aria-label="Edit">
        <MaterialIcon name="edit" />
      </Button>
      <Button variant="floating" size="lg" aria-label="Edit">
        <MaterialIcon name="edit" />
      </Button>
    </div>
  );
}
