import { Button } from "@/components/ui/button";

export function ButtonVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Button variant="raised">Raised</Button>
      <Button variant="flat">Flat</Button>
      <Button variant="outlined" color="secondary">
        Outlined
      </Button>
      <Button disabled>Disabled</Button>
      <Button variant="flat" disabled>
        Disabled flat
      </Button>
    </div>
  );
}
