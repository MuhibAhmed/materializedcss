import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/icons";

export function ButtonPulse() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <Button variant="floating" size="lg" color="primary" pulse aria-label="New message">
        <MaterialIcon name="mail" />
      </Button>
      <Button pulse>Pulse</Button>
    </div>
  );
}
