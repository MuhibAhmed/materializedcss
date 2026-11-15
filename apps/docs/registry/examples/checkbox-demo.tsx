import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox label="Red" />
      <Checkbox label="Yellow" defaultChecked />
      <Checkbox label="Filled in" variant="filled-in" defaultChecked />
      <Checkbox label="Indeterminate" defaultChecked="indeterminate" />
      <Checkbox label="Brown (disabled)" disabled />
    </div>
  );
}
