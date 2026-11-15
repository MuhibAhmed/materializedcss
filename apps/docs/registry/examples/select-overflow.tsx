import { Select, SelectItem } from "@/components/ui/select";

export function SelectOverflow() {
  return (
    <div className="h-32 w-full max-w-sm overflow-hidden rounded-ui border border-border bg-surface-2 px-4">
      <Select label="Inside overflow: hidden">
        {["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot"].map((name) => (
          <SelectItem key={name} value={name.toLowerCase()}>
            {name}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
