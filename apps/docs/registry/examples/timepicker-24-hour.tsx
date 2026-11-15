import { Timepicker } from "@/components/ui/timepicker";

export function Timepicker24Hour() {
  return <Timepicker label="Departure" locale="en-GB" twelveHour={false} defaultValue="18:45" />;
}
