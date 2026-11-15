import { Divider } from "@/components/ui/divider";

export function DividerDemo() {
  return (
    <div className="w-full max-w-md space-y-4 text-foreground">
      <div>
        <h3 className="text-lg">Section one</h3>
        <p className="text-muted-foreground">Stuff about section one.</p>
      </div>
      <Divider />
      <div>
        <h3 className="text-lg">Section two</h3>
        <p className="text-muted-foreground">Stuff about section two.</p>
      </div>
    </div>
  );
}
