import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/icons";

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Button>Button</Button>
      <Button>
        <MaterialIcon name="cloud" />
        Upload
      </Button>
      <Button variant="floating" size="lg" color="primary" aria-label="Add">
        <MaterialIcon name="add" />
      </Button>
    </div>
  );
}
