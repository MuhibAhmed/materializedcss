/**
 * Date and time helpers shared by the Calendar, Datepicker and Timepicker.
 *
 * Pure functions with no date-library dependency. Every `Date` produced here is
 * a local-time calendar day at midnight (or a wall-clock time), never a UTC
 * instant, so results do not shift with the user's time zone.
 */

/** 0 = Sunday … 6 = Saturday (same as `Date.prototype.getDay`). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Name widths accepted by `Intl.DateTimeFormat` for weekdays and months. */
export type NameFormat = "narrow" | "short" | "long";

/** A wall-clock time without a date. */
export interface TimeValue {
  /** 0–23 */
  hours: number;
  /** 0–59 */
  minutes: number;
}

/** Constraints that decide whether a day can be picked. */
export interface DateConstraints {
  /** Earliest selectable day (inclusive). */
  minDate?: Date | null | undefined;
  /** Latest selectable day (inclusive). */
  maxDate?: Date | null | undefined;
  /** Return `true` to disable a day. */
  disabledDays?: ((date: Date) => boolean) | undefined;
  /** Disable Saturdays and Sundays. */
  disableWeekends?: boolean | undefined;
}

const DEFAULT_LOCALE = "en-US";

/** `navigator.language` in the browser, `"en-US"` on the server. */
export function getDefaultLocale(): string {
  if (typeof navigator !== "undefined" && typeof navigator.language === "string" && navigator.language) {
    return navigator.language;
  }
  return DEFAULT_LOCALE;
}

interface LocaleTextInfoApi {
  getTextInfo?: () => { direction?: string };
  textInfo?: { direction?: string };
}

const RTL_LANGUAGES = new Set(["ar", "arc", "ckb", "dv", "fa", "he", "iw", "ks", "ku", "ps", "sd", "ug", "ur", "yi"]);

/** Writing direction of a locale (`"rtl"` for Arabic, Hebrew, Persian, Urdu…). */
export function getTextDirection(locale: string = getDefaultLocale()): "ltr" | "rtl" {
  try {
    const intlLocale = new Intl.Locale(locale);
    const api = intlLocale as unknown as LocaleTextInfoApi;
    const info = typeof api.getTextInfo === "function" ? api.getTextInfo() : api.textInfo;
    if (info?.direction === "rtl" || info?.direction === "ltr") return info.direction;
    return RTL_LANGUAGES.has(intlLocale.language) ? "rtl" : "ltr";
  } catch {
    return "ltr";
  }
}

/** True for a `Date` that holds a valid time value. */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/** The same calendar day at 00:00 local time. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The first day of the date's month. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** The last day of the date's month. */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** Number of days in a month (`month` is 0-based). */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Add (or subtract) whole days. Works on calendar days, so DST changes do not matter. */
export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/**
 * Add (or subtract) months. The day is clamped to the target month, so
 * Jan 31 + 1 month is Feb 28 (or 29), never Mar 3.
 */
export function addMonths(date: Date, amount: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const day = Math.min(date.getDate(), getDaysInMonth(target.getFullYear(), target.getMonth()));
  return new Date(target.getFullYear(), target.getMonth(), day);
}

/** Add (or subtract) years; Feb 29 becomes Feb 28 in non-leap years. */
export function addYears(date: Date, amount: number): Date {
  return addMonths(date, amount * 12);
}

/** Same calendar day (ignores the time). */
export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Same month of the same year. */
export function isSameMonth(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Compare two days ignoring time: negative if `a` is earlier, 0 if the same day, positive if later. */
export function compareDays(a: Date, b: Date): number {
  return (
    (a.getFullYear() - b.getFullYear()) * 10000 + (a.getMonth() - b.getMonth()) * 100 + (a.getDate() - b.getDate())
  );
}

/** `a` is an earlier calendar day than `b`. */
export function isBeforeDay(a: Date, b: Date): boolean {
  return compareDays(a, b) < 0;
}

/** `a` is a later calendar day than `b`. */
export function isAfterDay(a: Date, b: Date): boolean {
  return compareDays(a, b) > 0;
}

/** `date` lies between `from` and `to` (inclusive, either order). */
export function isDayInRange(date: Date, from: Date, to: Date): boolean {
  const [start, end] = compareDays(from, to) <= 0 ? [from, to] : [to, from];
  return compareDays(date, start) >= 0 && compareDays(date, end) <= 0;
}

/** Clamp a day into `[min, max]` (either bound may be missing). Returns a new date at midnight. */
export function clampDate(date: Date, min?: Date | null, max?: Date | null): Date {
  if (min && isBeforeDay(date, min)) return startOfDay(min);
  if (max && isAfterDay(date, max)) return startOfDay(max);
  return startOfDay(date);
}

/** Saturday or Sunday. */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** True when the day violates any of the constraints. */
export function isDateDisabled(date: Date, constraints: DateConstraints = {}): boolean {
  const { minDate, maxDate, disabledDays, disableWeekends } = constraints;
  if (minDate && isBeforeDay(date, minDate)) return true;
  if (maxDate && isAfterDay(date, maxDate)) return true;
  if (disableWeekends && isWeekend(date)) return true;
  return disabledDays ? disabledDays(date) : false;
}

/** The first day of the week containing `date`. */
export function startOfWeek(date: Date, firstDayOfWeek: Weekday = 0): Date {
  const offset = (date.getDay() - firstDayOfWeek + 7) % 7;
  return addDays(date, -offset);
}

/** The last day of the week containing `date`. */
export function endOfWeek(date: Date, firstDayOfWeek: Weekday = 0): Date {
  return addDays(startOfWeek(date, firstDayOfWeek), 6);
}

/**
 * Six weeks of seven days covering `month`, starting on `firstDayOfWeek`.
 * Days of the previous and next month fill the gaps ("outside days"), so the
 * grid never changes height between months.
 */
export function getCalendarMatrix(month: Date, firstDayOfWeek: Weekday = 0): Date[][] {
  const first = startOfWeek(startOfMonth(month), firstDayOfWeek);
  const weeks: Date[][] = [];
  for (let week = 0; week < 6; week += 1) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day += 1) days.push(addDays(first, week * 7 + day));
    weeks.push(days);
  }
  return weeks;
}

/**
 * Localized weekday names ordered from `firstDayOfWeek`.
 * `getWeekdayNames("en-US", "narrow")` → `["S", "M", "T", "W", "T", "F", "S"]`.
 */
export function getWeekdayNames(locale: string, format: NameFormat = "short", firstDayOfWeek: Weekday = 0): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: format });
  // 4 January 2026 is a Sunday.
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2026, 0, 4 + ((firstDayOfWeek + index) % 7))));
}

/** Localized month names, January first. */
export function getMonthNames(locale: string, format: NameFormat = "long"): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: format });
  return Array.from({ length: 12 }, (_, index) => formatter.format(new Date(2026, index, 1)));
}

interface WeekInfoLike {
  firstDay?: number;
  weekend?: number[];
}

interface LocaleWeekInfoApi {
  getWeekInfo?: () => WeekInfoLike;
  weekInfo?: WeekInfoLike;
}

// CLDR regions whose week starts on Sunday or Saturday; everything else starts on Monday.
const SUNDAY_REGIONS = new Set(
  "AG AS BD BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW".split(
    " ",
  ),
);
const SATURDAY_REGIONS = new Set("AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY".split(" "));

/**
 * The locale's first day of the week, from `Intl.Locale#getWeekInfo()` (or the
 * older `weekInfo` getter), falling back to a CLDR region table on engines
 * without week info (Firefox).
 */
export function getFirstDayOfWeek(locale: string = getDefaultLocale()): Weekday {
  let intlLocale: Intl.Locale;
  try {
    intlLocale = new Intl.Locale(locale);
  } catch {
    return 0;
  }
  try {
    const api = intlLocale as unknown as LocaleWeekInfoApi;
    const info = typeof api.getWeekInfo === "function" ? api.getWeekInfo() : api.weekInfo;
    if (info && typeof info.firstDay === "number" && info.firstDay >= 1 && info.firstDay <= 7) {
      return (info.firstDay % 7) as Weekday;
    }
  } catch {
    // Fall through to the region table.
  }
  const region = intlLocale.region ?? intlLocale.maximize().region ?? "US";
  if (SUNDAY_REGIONS.has(region)) return 0;
  if (SATURDAY_REGIONS.has(region)) return 6;
  return 1;
}

/** Format a day with `Intl.DateTimeFormat`. Defaults to Materialize's `mmm dd, yyyy` ("Nov 15, 2026"). */
export function formatDate(
  date: Date,
  locale: string = getDefaultLocale(),
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

const pad2 = (value: number): string => String(value).padStart(2, "0");

/** `yyyy-mm-dd` for the local calendar day (what `<input type="date">` and forms use). */
export function toISODateString(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, "0")}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Build a local date, or `null` if the parts do not form a real day (e.g. Feb 30). */
export function createDate(year: number, month: number, day: number): Date | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > getDaysInMonth(year, month - 1)) return null;
  const date = new Date(year, month - 1, day);
  // Years 0–99 are mapped to 1900–1999 by the Date constructor.
  date.setFullYear(year);
  return date;
}

/** Parse a strict `yyyy-mm-dd` string into a local date, or `null`. */
export function parseISODate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  return createDate(Number(match[1]), Number(match[2]), Number(match[3]));
}

// Zero code points of the Unicode decimal digit blocks used by common locales.
const DIGIT_ZEROS = [
  0x30, 0x660, 0x6f0, 0x7c0, 0x966, 0x9e6, 0xa66, 0xae6, 0xb66, 0xbe6, 0xc66, 0xce6, 0xd66, 0xe50, 0xed0, 0xf20, 0x1040,
  0x17e0, 0x1810, 0xff10,
];

/** Convert any Unicode decimal digits (Arabic-Indic, Devanagari, full-width…) to ASCII and drop bidi marks. */
export function normalizeDigits(text: string): string {
  return text.replace(/[‎‏؜]/g, "").replace(/\p{Nd}/gu, (char) => {
    const code = char.codePointAt(0) ?? 0x30;
    const zero = DIGIT_ZEROS.find((start) => code >= start && code < start + 10);
    return zero === undefined ? char : String(code - zero);
  });
}

/** Order of day, month and year in the locale's numeric date format, e.g. `["month", "day", "year"]`. */
export function getDatePartOrder(locale: string): Array<"day" | "month" | "year"> {
  const parts = new Intl.DateTimeFormat(locale, { year: "numeric", month: "numeric", day: "numeric" }).formatToParts(
    new Date(2026, 10, 15),
  );
  const order = parts
    .map((part) => part.type)
    .filter((type): type is "day" | "month" | "year" => type === "day" || type === "month" || type === "year");
  return order.length === 3 ? order : ["month", "day", "year"];
}

const simplify = (text: string): string =>
  text
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ.]/g, "")
    .trim();

function findMonthName(text: string, locale: string): number | null {
  const haystack = simplify(text);
  const candidates: Array<[string, number]> = [];
  for (const loc of [locale, DEFAULT_LOCALE]) {
    for (const format of ["long", "short"] as const) {
      getMonthNames(loc, format).forEach((name, index) => candidates.push([simplify(name), index]));
    }
  }
  // Longest names first so "June" wins over "Jun".
  candidates.sort((a, b) => b[0].length - a[0].length);
  for (const [name, index] of candidates) {
    if (name && !/^\d+$/.test(name) && haystack.includes(name)) return index + 1;
  }
  return null;
}

const expandYear = (year: number, digits: number): number => (digits <= 2 ? 2000 + year : year);

/**
 * Parse what a user typed into a date field. Accepts `yyyy-mm-dd`, the locale's
 * numeric order (`11/15/2026` in en-US, `15.11.2026` in de-DE, native digits in
 * ar-EG), and text months such as `Nov 15, 2026` or `15. November 2026`.
 * Returns `null` for anything that is not a real day.
 */
export function parseLocaleDate(text: string | null | undefined, locale: string = getDefaultLocale()): Date | null {
  if (!text) return null;
  const normalized = normalizeDigits(text).trim();
  if (!normalized) return null;
  const iso = parseISODate(normalized);
  if (iso) return iso;

  const numbers = normalized.match(/\d+/g) ?? [];
  const hasLetters = /\p{L}/u.test(normalized.replace(/\d+/g, ""));

  if (numbers.length === 3) {
    const order = getDatePartOrder(locale);
    // A leading 4-digit number is always a year (yyyy/mm/dd), whatever the locale.
    const effective: Array<"day" | "month" | "year"> =
      numbers[0]!.length === 4 && order[0] !== "year" ? ["year", "month", "day"] : order;
    const parts: Record<"day" | "month" | "year", number> = { day: 0, month: 0, year: 0 };
    let yearDigits = 4;
    effective.forEach((type, index) => {
      const raw = numbers[index]!;
      parts[type] = Number(raw);
      if (type === "year") yearDigits = raw.length;
    });
    return createDate(expandYear(parts.year, yearDigits), parts.month, parts.day);
  }

  if (numbers.length === 2 && hasLetters) {
    const month = findMonthName(normalized, locale);
    if (month === null) return null;
    const [first, second] = numbers as [string, string];
    const firstIsYear = first.length >= 3 || Number(first) > 31;
    const yearRaw = firstIsYear ? first : second;
    const dayRaw = firstIsYear ? second : first;
    return createDate(expandYear(Number(yearRaw), yearRaw.length), month, Number(dayRaw));
  }

  return null;
}

/** Years shown by a year picker: `[from, to]` inclusive, clamped by min/max dates. */
export function getYearRange(
  around: number,
  range: number | readonly [number, number] = 100,
  minDate?: Date | null,
  maxDate?: Date | null,
): [number, number] {
  let [from, to] = typeof range === "number" ? [around - range, around + range] : [range[0], range[1]];
  if (minDate) from = Math.max(from, minDate.getFullYear());
  if (maxDate) to = Math.min(to, maxDate.getFullYear());
  if (to < from) to = from;
  return [from, to];
}

/* ------------------------------------------------------------------------------------------------
 * Time helpers
 * ----------------------------------------------------------------------------------------------*/

/** Parse a strict 24-hour `"HH:mm"` (or `"H:mm"`) value. */
export function parseTime(value: string | null | undefined): TimeValue | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

/** `{ hours: 9, minutes: 5 }` → `"09:05"`. */
export function formatTimeValue(time: TimeValue): string {
  return `${pad2(time.hours)}:${pad2(time.minutes)}`;
}

/** Minutes since midnight. */
export function timeToMinutes(time: TimeValue): number {
  return time.hours * 60 + time.minutes;
}

/** The locale's preferred clock, e.g. `"h12"` for en-US and `"h23"` for de-DE. */
export function getHourCycle(locale: string = getDefaultLocale()): "h11" | "h12" | "h23" | "h24" {
  try {
    const cycle = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle;
    if (cycle === "h11" || cycle === "h12" || cycle === "h23" || cycle === "h24") return cycle;
  } catch {
    // ignore
  }
  return "h12";
}

/** True when the locale normally shows a 12-hour clock with AM/PM. */
export function prefersTwelveHourClock(locale: string = getDefaultLocale()): boolean {
  const cycle = getHourCycle(locale);
  return cycle === "h11" || cycle === "h12";
}

/** Localized AM and PM labels, e.g. `["AM", "PM"]`, `["午前", "午後"]`, `["ص", "م"]`. */
export function getDayPeriodNames(locale: string = getDefaultLocale()): [string, string] {
  const read = (hour: number, fallback: string): string => {
    try {
      const parts = new Intl.DateTimeFormat(locale, { hour: "numeric", hourCycle: "h12" }).formatToParts(
        new Date(2026, 0, 1, hour),
      );
      return parts.find((part) => part.type === "dayPeriod")?.value ?? fallback;
    } catch {
      return fallback;
    }
  };
  return [read(9, "AM"), read(21, "PM")];
}

/** Format a wall-clock time for display, e.g. `"10:30 AM"` or `"22:30"`. */
export function formatTime(
  time: TimeValue,
  locale: string = getDefaultLocale(),
  twelveHour: boolean = prefersTwelveHourClock(locale),
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: twelveHour ? "numeric" : "2-digit",
    minute: "2-digit",
    hourCycle: twelveHour ? "h12" : "h23",
  }).format(new Date(2026, 0, 1, time.hours, time.minutes));
}

/**
 * Parse a typed time: `"22:30"`, `"10:30 pm"`, `"10.30 PM"`, `"7 am"`, or
 * localized day periods such as `"午後10:30"`. Returns `null` when invalid.
 */
export function parseTimeInput(text: string | null | undefined, locale: string = getDefaultLocale()): TimeValue | null {
  if (!text) return null;
  const normalized = normalizeDigits(text).trim();
  if (!normalized) return null;
  const numbers = normalized.match(/\d+/g) ?? [];
  if (numbers.length === 0 || numbers.length > 2) return null;

  let hours: number;
  let minutes: number;
  if (numbers.length === 1 && numbers[0]!.length >= 3) {
    // "1030" / "930"
    const raw = numbers[0]!.padStart(4, "0");
    hours = Number(raw.slice(0, 2));
    minutes = Number(raw.slice(2));
  } else {
    hours = Number(numbers[0]);
    minutes = numbers[1] === undefined ? 0 : Number(numbers[1]);
  }

  const lower = simplify(normalized.replace(/\d+/g, " "));
  const [amName, pmName] = getDayPeriodNames(locale).map(simplify) as [string, string];
  let period: "am" | "pm" | null = null;
  if ((pmName && lower.includes(pmName)) || /\bp\s?m?\b/.test(lower)) period = "pm";
  else if ((amName && lower.includes(amName)) || /\ba\s?m?\b/.test(lower)) period = "am";

  if (period) {
    if (hours < 1 || hours > 12) return null;
    if (period === "pm" && hours < 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
  }
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}
