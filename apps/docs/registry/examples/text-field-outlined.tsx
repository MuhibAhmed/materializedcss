import { MaterialIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/text-field";

export function TextFieldOutlined() {
  return (
    <div className="grid w-full max-w-xl grid-cols-1 gap-x-6 sm:grid-cols-2">
      <TextField variant="outlined" label="Company" helperText="Optional" />
      <TextField variant="outlined" label="Search" prefix={<MaterialIcon name="search" />} />
      <TextField variant="outlined" label="Code" error="This code has expired" defaultValue="X-1234" />
      <TextField variant="outlined" label="Disabled" disabled defaultValue="Read only" />
    </div>
  );
}
