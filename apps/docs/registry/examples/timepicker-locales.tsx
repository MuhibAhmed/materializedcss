import { Timepicker } from "@/components/ui/timepicker";

export function TimepickerLocales() {
  return (
    <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-3">
      <Timepicker
        label="Uhrzeit"
        locale="de-DE"
        defaultValue="14:05"
        i18n={{ cancel: "Abbrechen", clear: "Löschen", done: "OK", openPicker: "Uhrzeit wählen", title: "Uhrzeit wählen", hours: "Stunden", minutes: "Minuten" }}
      />
      <Timepicker
        label="الوقت"
        locale="ar-EG"
        defaultValue="21:30"
        i18n={{ cancel: "إلغاء", clear: "مسح", done: "تم", openPicker: "اختر الوقت", title: "اختر الوقت", hours: "الساعات", minutes: "الدقائق" }}
      />
      <Timepicker
        label="時刻"
        locale="ja-JP"
        twelveHour
        defaultValue="09:15"
        i18n={{ cancel: "キャンセル", clear: "クリア", done: "OK", openPicker: "時刻を選択", title: "時刻を選択", hours: "時", minutes: "分" }}
      />
    </div>
  );
}
