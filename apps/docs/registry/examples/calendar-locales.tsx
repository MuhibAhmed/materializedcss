import { Calendar } from "@/components/ui/calendar";

export function CalendarLocales() {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      {["de-DE", "ar-EG", "ja-JP"].map((locale) => (
        <figure key={locale} className="m-0 flex flex-col items-center gap-2">
          <Calendar locale={locale} className="rounded-ui shadow-z1" />
          <figcaption className="font-mono text-xs text-muted-foreground">{locale}</figcaption>
        </figure>
      ))}
    </div>
  );
}
