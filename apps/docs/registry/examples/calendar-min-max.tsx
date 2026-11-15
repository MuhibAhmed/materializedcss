"use client";

import { Calendar } from "@/components/ui/calendar";

export function CalendarMinMax() {
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3);
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 10);

  return <Calendar locale="en-US" minDate={minDate} maxDate={maxDate} className="rounded-ui shadow-z1" />;
}
