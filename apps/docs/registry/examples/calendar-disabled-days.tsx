"use client";

import { Calendar } from "@/components/ui/calendar";

// Weekends are closed, and so is the 13th of every month.
const isClosed = (date: Date) => date.getDate() === 13;

export function CalendarDisabledDays() {
  return <Calendar locale="en-US" disableWeekends disabledDays={isClosed} className="rounded-ui shadow-z1" />;
}
