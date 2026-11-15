import { Calendar } from "@/components/ui/calendar";

export function CalendarOutsideDays() {
  return <Calendar locale="en-GB" showOutsideDays firstDayOfWeek={1} className="rounded-ui shadow-z1" />;
}
