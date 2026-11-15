"use client";

import { Datepicker } from "@/components/ui/datepicker";

export function DatepickerMinMax() {
  const today = new Date();
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());

  return (
    <Datepicker
      label="Delivery date"
      locale="en-US"
      minDate={today}
      maxDate={maxDate}
      helperText="Within the next two months"
    />
  );
}
