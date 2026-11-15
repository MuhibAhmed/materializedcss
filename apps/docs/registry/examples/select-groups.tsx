import { Select, SelectGroup, SelectItem, SelectLabel, SelectSeparator } from "@/components/ui/select";

export function SelectGroups() {
  return (
    <div className="w-full max-w-sm">
      <Select label="Optgroups" placeholder="Choose your option">
        <SelectGroup>
          <SelectLabel>Team 1</SelectLabel>
          <SelectItem value="1">Option 1</SelectItem>
          <SelectItem value="2">Option 2</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Team 2</SelectLabel>
          <SelectItem value="3">Option 3</SelectItem>
          <SelectItem value="4">Option 4</SelectItem>
        </SelectGroup>
      </Select>
    </div>
  );
}
