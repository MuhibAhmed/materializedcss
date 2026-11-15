import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxDescription() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <Checkbox label="Accept terms and conditions" description="You agree to our Terms of Service and Privacy Policy." />
      <Checkbox
        variant="filled-in"
        label="Email me product updates"
        description="At most one email a month. Unsubscribe at any time."
        defaultChecked
      />
    </div>
  );
}
