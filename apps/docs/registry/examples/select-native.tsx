import { NativeSelect } from "@/components/ui/select";

export function SelectNative() {
  return (
    <div className="w-full max-w-sm">
      <NativeSelect label="Browser select" name="size" defaultValue="" helperText="Uses the platform picker">
        <option value="" disabled>
          Choose your option
        </option>
        <option value="s">Small</option>
        <option value="m">Medium</option>
        <option value="l">Large</option>
      </NativeSelect>
    </div>
  );
}
