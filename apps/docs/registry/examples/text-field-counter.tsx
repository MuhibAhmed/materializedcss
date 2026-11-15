import { TextField } from "@/components/ui/text-field";

export function TextFieldCounter() {
  return (
    <div className="w-full max-w-md">
      <TextField label="Tweet" maxLength={20} showCount />
      <TextField
        label="Bio (soft limit)"
        maxLength={10}
        showCount
        enforceMaxLength={false}
        defaultValue="Longer than ten"
        helperText="You can type past the limit; the counter turns red"
      />
    </div>
  );
}
