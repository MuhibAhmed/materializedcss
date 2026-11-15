import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="yellow" aria-label="Favorite color">
      <RadioGroupItem value="red" label="Red" />
      <RadioGroupItem value="yellow" label="Yellow" />
      <RadioGroupItem value="green" label="Green" />
      <RadioGroupItem value="brown" label="Brown" disabled />
    </RadioGroup>
  );
}
