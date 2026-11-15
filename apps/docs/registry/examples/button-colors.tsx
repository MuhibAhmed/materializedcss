import { Button } from "@/components/ui/button";

export function ButtonColors() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Button color="secondary">Secondary</Button>
      <Button color="primary">Primary</Button>
      <Button color="success">Success</Button>
      <Button color="error">Error</Button>
      <Button className="bg-md-indigo-500 text-white">Palette class</Button>
    </div>
  );
}
