import { Select, SelectItem } from "@/components/ui/select";

export function SelectDemo() {
  return (
    <div className="w-full max-w-sm">
      <Select label="Materialize select" helperText="Pick your favorite">
        <SelectItem value="1">Option 1</SelectItem>
        <SelectItem value="2">Option 2</SelectItem>
        <SelectItem value="3">Option 3</SelectItem>
        <SelectItem value="4" disabled>
          Option 4 (sold out)
        </SelectItem>
      </Select>
    </div>
  );
}
