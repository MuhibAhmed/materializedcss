"use client";

import { Datepicker } from "@/components/ui/datepicker";

const holidays = ["12-24", "12-25", "12-26", "12-31", "01-01"];
const isHoliday = (date: Date) =>
  holidays.includes(`${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);

export function DatepickerDisabledDays() {
  return (
    <Datepicker
      label="Appointment"
      locale="en-US"
      disableWeekends
      disabledDays={isHoliday}
      helperText="Weekdays only, closed on holidays"
    />
  );
}
