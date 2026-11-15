import { Autocomplete } from "@/components/ui/autocomplete";
import { MaterialIcon } from "@/components/ui/icons";

const data = {
  Apple: null,
  Apricot: null,
  Avocado: null,
  Banana: null,
  Blackberry: null,
  Blueberry: null,
  Cherry: null,
  Grape: null,
  Mango: null,
  Pineapple: null,
};

export function AutocompleteDemo() {
  return (
    <div className="w-full max-w-md">
      <Autocomplete label="Fruit" data={data} prefix={<MaterialIcon name="textsms" />} helperText="Try “ap” or “berry”" />
    </div>
  );
}
