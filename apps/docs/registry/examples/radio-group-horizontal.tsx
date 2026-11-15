import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RadioGroupHorizontal() {
  return (
    <RadioGroup orientation="horizontal" defaultValue="m" aria-label="Size">
      <RadioGroupItem value="s" label="Small" />
      <RadioGroupItem value="m" label="Medium" />
      <RadioGroupItem value="l" label="Large" />
    </RadioGroup>
  );
}
