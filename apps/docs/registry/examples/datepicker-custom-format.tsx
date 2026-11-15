"use client";

import { Datepicker } from "@/components/ui/datepicker";

// dd/mm/yyyy, regardless of the browser locale.
const pad = (n: number) => String(n).padStart(2, "0");
const formatDate = (date: Date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
const parseDate = (text: string) => {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return date.getMonth() === Number(match[2]) - 1 ? date : null;
};

export function DatepickerCustomFormat() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <Datepicker label="Long format" locale="en-US" format={{ weekday: "long", month: "long", day: "numeric", year: "numeric" }} />
      <Datepicker label="dd/mm/yyyy" locale="en-US" formatDate={formatDate} parseDate={parseDate} placeholder="dd/mm/yyyy" />
    </div>
  );
}
