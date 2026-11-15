import { Datepicker } from "@/components/ui/datepicker";

export function DatepickerLocales() {
  return (
    <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-3">
      <Datepicker
        label="Datum"
        locale="de-DE"
        defaultValue={new Date(2026, 10, 15)}
        i18n={{ cancel: "Abbrechen", clear: "Löschen", done: "OK", openPicker: "Datum wählen", title: "Datum wählen" }}
        showClearBtn
      />
      <Datepicker
        label="التاريخ"
        locale="ar-EG"
        defaultValue={new Date(2026, 10, 15)}
        i18n={{ cancel: "إلغاء", clear: "مسح", done: "تم", openPicker: "اختر التاريخ", title: "اختر التاريخ" }}
      />
      <Datepicker
        label="日付"
        locale="ja-JP"
        defaultValue={new Date(2026, 10, 15)}
        format={{ dateStyle: "long" }}
        i18n={{ cancel: "キャンセル", clear: "クリア", done: "OK", openPicker: "日付を選択", title: "日付を選択" }}
      />
    </div>
  );
}
