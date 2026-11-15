import { ChipsInput } from "@/components/ui/chips-input";

export function ChipsInputDemo() {
  return (
    <div className="w-full max-w-md">
      <ChipsInput
        label="Tags"
        defaultValue={["React", "Tailwind"]}
        placeholder="Enter a tag"
        secondaryPlaceholder="+Tag"
        helperText="Press Enter or comma to add"
      />
    </div>
  );
}
