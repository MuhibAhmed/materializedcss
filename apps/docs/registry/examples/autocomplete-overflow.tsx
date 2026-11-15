import { Autocomplete } from "@/components/ui/autocomplete";

const cities = ["Amsterdam", "Athens", "Auckland", "Austin", "Barcelona", "Berlin", "Bogotá", "Boston", "Brussels"];

export function AutocompleteOverflow() {
  return (
    <div className="h-28 w-full max-w-sm overflow-hidden rounded-ui border border-border px-4">
      <Autocomplete label="City" options={cities.map((city) => ({ value: city }))} />
    </div>
  );
}
