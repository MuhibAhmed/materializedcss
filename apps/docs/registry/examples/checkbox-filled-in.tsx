import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxFilledIn() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox variant="filled-in" label="Filled in" />
      <Checkbox variant="filled-in" label="Checked" defaultChecked />
      <Checkbox variant="filled-in" label="Indeterminate" defaultChecked="indeterminate" />
      <Checkbox variant="filled-in" label="Disabled" disabled />
      <Checkbox variant="filled-in" label="Disabled checked" disabled defaultChecked />
    </div>
  );
}
