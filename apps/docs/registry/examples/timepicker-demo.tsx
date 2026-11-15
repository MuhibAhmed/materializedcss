import { Timepicker } from "@/components/ui/timepicker";

export function TimepickerDemo() {
  return <Timepicker className="max-w-xs" label="Alarm" locale="en-US" defaultValue="10:30" showClearBtn />;
}
