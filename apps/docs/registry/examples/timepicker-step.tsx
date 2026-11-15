import { Timepicker } from "@/components/ui/timepicker";

export function TimepickerStep() {
  return (
    <Timepicker
      className="max-w-xs"
      label="Meeting"
      locale="en-US"
      step={15}
      minTime="09:00"
      maxTime="17:30"
      defaultValue="09:00"
      helperText="Office hours, 15-minute slots"
    />
  );
}
