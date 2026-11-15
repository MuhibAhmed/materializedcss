"use client";

import { Calendar } from "@/components/ui/calendar";

export function CalendarEvents() {
  const today = new Date();
  const day = (offset: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);

  return <Calendar locale="en-US" events={[day(-6), day(2), day(3), day(9)]} className="rounded-ui shadow-z1" />;
}
