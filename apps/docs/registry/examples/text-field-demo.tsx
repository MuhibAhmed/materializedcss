import { TextField } from "@/components/ui/text-field";

export function TextFieldDemo() {
  return (
    <div className="grid w-full max-w-xl grid-cols-1 gap-x-6 sm:grid-cols-2">
      <TextField label="First name" name="firstName" autoComplete="given-name" />
      <TextField label="Last name" name="lastName" autoComplete="family-name" />
      <TextField label="Disabled" defaultValue="I am not editable" disabled className="sm:col-span-2" />
      <TextField label="Password" type="password" autoComplete="new-password" className="sm:col-span-2" />
      <TextField
        label="Email"
        type="email"
        validate
        helperText="Turns red or green after you leave the field"
        className="sm:col-span-2"
      />
    </div>
  );
}
