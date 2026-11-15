import { MultiSelect } from "@/components/ui/select";

const toppings = [
  { value: "cheese", label: "Cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
  { value: "peppers", label: "Peppers" },
  { value: "pineapple", label: "Pineapple", disabled: true },
];

export function SelectMultiple() {
  return (
    <div className="grid w-full max-w-xl grid-cols-1 gap-x-6 sm:grid-cols-2">
      <MultiSelect label="Toppings" options={toppings} defaultValue={["cheese"]} />
      <MultiSelect label="Toppings (chips)" options={toppings} display="chips" placeholder="None yet" />
    </div>
  );
}
