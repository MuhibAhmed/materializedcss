import { Datepicker } from "@/components/ui/datepicker";

export function DatepickerStates() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <Datepicker label="Read only" locale="en-US" readOnly defaultValue={new Date(2026, 0, 1)} />
      <Datepicker label="Disabled" locale="en-US" disabled defaultValue={new Date(2026, 0, 1)} />
    </div>
  );
}
