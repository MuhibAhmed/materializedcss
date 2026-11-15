import { MaterialIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/text-field";

export function TextFieldPrefix() {
  return (
    <div className="grid w-full max-w-xl grid-cols-1 gap-x-6 sm:grid-cols-2">
      <TextField label="Username" prefix={<MaterialIcon name="account_circle" />} />
      <TextField label="Telephone" type="tel" prefix={<MaterialIcon name="phone" />} />
    </div>
  );
}
