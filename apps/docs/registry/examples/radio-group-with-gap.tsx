import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RadioGroupWithGap() {
  return (
    <RadioGroup variant="with-gap" defaultValue="standard" aria-label="Shipping">
      <RadioGroupItem value="standard" label="Standard" description="4 to 6 business days" />
      <RadioGroupItem value="express" label="Express" description="1 to 2 business days" />
      <RadioGroupItem value="pickup" label="Pick up in store" description="Not available near you" disabled />
    </RadioGroup>
  );
}
