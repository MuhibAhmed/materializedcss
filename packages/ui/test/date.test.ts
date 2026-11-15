import { describe, expect, it } from "vitest";

import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compareDays,
  createDate,
  endOfMonth,
  endOfWeek,
  formatDate,
  formatTime,
  formatTimeValue,
  getCalendarMatrix,
  getDatePartOrder,
  getDayPeriodNames,
  getDaysInMonth,
  getFirstDayOfWeek,
  getHourCycle,
  getMonthNames,
  getTextDirection,
  getWeekdayNames,
  getYearRange,
  isAfterDay,
  isBeforeDay,
  isDateDisabled,
  isDayInRange,
  isSameDay,
  isSameMonth,
  isValidDate,
  isWeekend,
  normalizeDigits,
  parseISODate,
  parseLocaleDate,
  parseTime,
  parseTimeInput,
  prefersTwelveHourClock,
  startOfMonth,
  startOfWeek,
  timeToMinutes,
  toISODateString,
} from "@/lib/date";

const d = (year: number, month: number, day: number): Date => new Date(year, month - 1, day);
const iso = (date: Date | null): string | null => (date ? toISODateString(date) : null);

describe("day arithmetic", () => {
  it("startOfMonth / endOfMonth / getDaysInMonth", () => {
    expect(iso(startOfMonth(d(2026, 11, 15)))).toBe("2026-11-01");
    expect(iso(endOfMonth(d(2026, 11, 15)))).toBe("2026-11-30");
    expect(getDaysInMonth(2024, 1)).toBe(29);
    expect(getDaysInMonth(2026, 1)).toBe(28);
    expect(getDaysInMonth(2026, 11)).toBe(31);
  });

  it("addDays crosses months and years", () => {
    expect(iso(addDays(d(2026, 12, 31), 1))).toBe("2027-01-01");
    expect(iso(addDays(d(2026, 3, 1), -1))).toBe("2026-02-28");
    expect(iso(addDays(d(2026, 11, 15), 0))).toBe("2026-11-15");
  });

  it("addDays ignores the time of day and DST transitions", () => {
    // 29 March 2026 is the EU DST switch; calendar days must still advance by one.
    const start = new Date(2026, 2, 28, 23, 30);
    expect(iso(addDays(start, 1))).toBe("2026-03-29");
    expect(iso(addDays(start, 2))).toBe("2026-03-30");
    expect(addDays(start, 1).getHours()).toBe(0);
  });

  it("addMonths clamps to the end of shorter months", () => {
    expect(iso(addMonths(d(2026, 1, 31), 1))).toBe("2026-02-28");
    expect(iso(addMonths(d(2024, 1, 31), 1))).toBe("2024-02-29");
    expect(iso(addMonths(d(2026, 3, 31), -1))).toBe("2026-02-28");
    expect(iso(addMonths(d(2026, 11, 15), 2))).toBe("2027-01-15");
    expect(iso(addMonths(d(2026, 1, 15), -13))).toBe("2024-12-15");
  });

  it("addYears handles leap days", () => {
    expect(iso(addYears(d(2024, 2, 29), 1))).toBe("2025-02-28");
    expect(iso(addYears(d(2026, 11, 15), -10))).toBe("2016-11-15");
  });

  it("compares calendar days regardless of time", () => {
    const morning = new Date(2026, 10, 15, 8);
    const evening = new Date(2026, 10, 15, 22);
    expect(isSameDay(morning, evening)).toBe(true);
    expect(isSameDay(morning, null)).toBe(false);
    expect(isSameMonth(d(2026, 11, 1), d(2026, 11, 30))).toBe(true);
    expect(isSameMonth(d(2026, 11, 1), d(2025, 11, 1))).toBe(false);
    expect(compareDays(morning, evening)).toBe(0);
    expect(isBeforeDay(d(2026, 11, 14), morning)).toBe(true);
    expect(isBeforeDay(evening, morning)).toBe(false);
    expect(isAfterDay(d(2027, 1, 1), d(2026, 12, 31))).toBe(true);
    expect(isAfterDay(d(2026, 12, 31), d(2027, 1, 1))).toBe(false);
  });

  it("isDayInRange accepts either order", () => {
    expect(isDayInRange(d(2026, 11, 10), d(2026, 11, 5), d(2026, 11, 20))).toBe(true);
    expect(isDayInRange(d(2026, 11, 10), d(2026, 11, 20), d(2026, 11, 5))).toBe(true);
    expect(isDayInRange(d(2026, 11, 21), d(2026, 11, 5), d(2026, 11, 20))).toBe(false);
  });

  it("clampDate", () => {
    const min = d(2026, 11, 10);
    const max = d(2026, 11, 20);
    expect(iso(clampDate(d(2026, 11, 1), min, max))).toBe("2026-11-10");
    expect(iso(clampDate(d(2026, 12, 1), min, max))).toBe("2026-11-20");
    expect(iso(clampDate(d(2026, 11, 15), min, max))).toBe("2026-11-15");
    expect(iso(clampDate(d(2026, 11, 15)))).toBe("2026-11-15");
  });

  it("isWeekend / isDateDisabled", () => {
    expect(isWeekend(d(2026, 11, 14))).toBe(true); // Saturday
    expect(isWeekend(d(2026, 11, 15))).toBe(true); // Sunday
    expect(isWeekend(d(2026, 11, 16))).toBe(false);
    const constraints = {
      minDate: d(2026, 11, 3),
      maxDate: d(2026, 11, 25),
      disableWeekends: true,
      disabledDays: (date: Date) => date.getDate() === 18,
    };
    expect(isDateDisabled(d(2026, 11, 2), constraints)).toBe(true);
    expect(isDateDisabled(d(2026, 11, 26), constraints)).toBe(true);
    expect(isDateDisabled(d(2026, 11, 21), constraints)).toBe(true);
    expect(isDateDisabled(d(2026, 11, 18), constraints)).toBe(true);
    expect(isDateDisabled(d(2026, 11, 17), constraints)).toBe(false);
    expect(isDateDisabled(d(2026, 11, 3), constraints)).toBe(false);
    expect(isDateDisabled(d(2026, 11, 25), constraints)).toBe(false);
  });

  it("startOfWeek / endOfWeek", () => {
    // Sunday 15 Nov 2026
    expect(iso(startOfWeek(d(2026, 11, 15), 0))).toBe("2026-11-15");
    expect(iso(startOfWeek(d(2026, 11, 15), 1))).toBe("2026-11-09");
    expect(iso(startOfWeek(d(2026, 11, 15), 6))).toBe("2026-11-14");
    expect(iso(endOfWeek(d(2026, 11, 15), 0))).toBe("2026-11-21");
    expect(iso(endOfWeek(d(2026, 11, 15), 1))).toBe("2026-11-15");
  });
});

describe("getCalendarMatrix", () => {
  it("returns 6 weeks of 7 days starting on Sunday", () => {
    const weeks = getCalendarMatrix(d(2026, 11, 15), 0);
    expect(weeks).toHaveLength(6);
    for (const week of weeks) expect(week).toHaveLength(7);
    // November 2026 starts on a Sunday.
    expect(iso(weeks[0]![0]!)).toBe("2026-11-01");
    expect(iso(weeks[5]![6]!)).toBe("2026-12-12");
    expect(weeks.flat().every((day) => day.getDay() === weeks.flat().indexOf(day) % 7)).toBe(true);
  });

  it("includes outside days when the week starts on Monday", () => {
    const weeks = getCalendarMatrix(d(2026, 11, 1), 1);
    expect(iso(weeks[0]![0]!)).toBe("2026-10-26");
    expect(weeks[0]![0]!.getDay()).toBe(1);
    expect(iso(weeks[0]![6]!)).toBe("2026-11-01");
  });

  it("works for Saturday-first weeks and February", () => {
    const weeks = getCalendarMatrix(d(2026, 2, 10), 6);
    expect(weeks[0]![0]!.getDay()).toBe(6);
    expect(iso(weeks[0]![0]!)).toBe("2026-01-31");
    const days = weeks.flat();
    expect(days.filter((day) => day.getMonth() === 1)).toHaveLength(28);
  });
});

describe("localized names", () => {
  it("weekday names follow locale and first day", () => {
    expect(getWeekdayNames("en-US", "narrow", 0)).toEqual(["S", "M", "T", "W", "T", "F", "S"]);
    expect(getWeekdayNames("en-US", "short", 1)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    expect(getWeekdayNames("de-DE", "long", 1)[0]).toBe("Montag");
    expect(getWeekdayNames("en-US", "long", 6)[0]).toBe("Saturday");
  });

  it("month names", () => {
    expect(getMonthNames("en-US")).toHaveLength(12);
    expect(getMonthNames("en-US")[10]).toBe("November");
    expect(getMonthNames("en-US", "short")[0]).toBe("Jan");
    expect(getMonthNames("de-DE")[2]).toBe("März");
  });

  it("first day of week from Intl week info or the fallback table", () => {
    expect(getFirstDayOfWeek("en-US")).toBe(0);
    expect(getFirstDayOfWeek("de-DE")).toBe(1);
    expect(getFirstDayOfWeek("en-GB")).toBe(1);
    expect(getFirstDayOfWeek("ja-JP")).toBe(0);
    expect(getFirstDayOfWeek("ar-EG")).toBe(6);
    expect(getFirstDayOfWeek("not a locale!")).toBe(0);
  });

  it("formatDate defaults to Materialize's mmm dd, yyyy", () => {
    expect(formatDate(d(2026, 11, 15), "en-US")).toBe("Nov 15, 2026");
    expect(formatDate(d(2026, 11, 15), "de-DE", { dateStyle: "medium" })).toBe("15.11.2026");
    expect(formatDate(d(2026, 11, 15), "en-US", { weekday: "short", month: "short", day: "numeric" })).toBe(
      "Sun, Nov 15",
    );
  });
});

describe("ISO dates", () => {
  it("round-trips yyyy-mm-dd", () => {
    expect(toISODateString(d(2026, 1, 5))).toBe("2026-01-05");
    expect(iso(parseISODate("2026-11-15"))).toBe("2026-11-15");
    expect(iso(parseISODate(" 2024-02-29 "))).toBe("2024-02-29");
  });

  it("rejects invalid days and formats", () => {
    expect(parseISODate("2026-02-30")).toBeNull();
    expect(parseISODate("2026-13-01")).toBeNull();
    expect(parseISODate("2026-1-5")).toBeNull();
    expect(parseISODate("")).toBeNull();
    expect(parseISODate(null)).toBeNull();
    expect(createDate(2026, 0, 1)).toBeNull();
  });

  it("keeps years below 100", () => {
    expect(createDate(50, 1, 1)?.getFullYear()).toBe(50);
  });

  it("isValidDate", () => {
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate(new Date("nope"))).toBe(false);
    expect(isValidDate("2026-01-01")).toBe(false);
  });
});

describe("parseLocaleDate", () => {
  it("normalizes native digits", () => {
    expect(normalizeDigits("١٥/١١/٢٠٢٦")).toBe("15/11/2026");
    expect(normalizeDigits("२०२६")).toBe("2026");
    expect(normalizeDigits("２０２６")).toBe("2026");
  });

  it("knows each locale's numeric order", () => {
    expect(getDatePartOrder("en-US")).toEqual(["month", "day", "year"]);
    expect(getDatePartOrder("de-DE")).toEqual(["day", "month", "year"]);
    expect(getDatePartOrder("ja-JP")).toEqual(["year", "month", "day"]);
  });

  it("parses numeric dates in the locale order", () => {
    expect(iso(parseLocaleDate("11/15/2026", "en-US"))).toBe("2026-11-15");
    expect(iso(parseLocaleDate("15.11.2026", "de-DE"))).toBe("2026-11-15");
    expect(iso(parseLocaleDate("2026/11/15", "ja-JP"))).toBe("2026-11-15");
    expect(iso(parseLocaleDate("١٥/١١/٢٠٢٦", "ar-EG"))).toBe("2026-11-15");
    expect(iso(parseLocaleDate("2026-11-15", "de-DE"))).toBe("2026-11-15");
    expect(iso(parseLocaleDate("2026/11/15", "en-US"))).toBe("2026-11-15");
    expect(iso(parseLocaleDate("1/2/26", "en-US"))).toBe("2026-01-02");
  });

  it("parses text months", () => {
    expect(iso(parseLocaleDate("Nov 15, 2026", "en-US"))).toBe("2026-11-15");
    expect(iso(parseLocaleDate("November 15 2026", "en-US"))).toBe("2026-11-15");
    expect(iso(parseLocaleDate("15. Nov. 2026", "de-DE"))).toBe("2026-11-15");
    expect(iso(parseLocaleDate("15. März 2026", "de-DE"))).toBe("2026-03-15");
    expect(iso(parseLocaleDate("15 June 2026", "fr-FR"))).toBe("2026-06-15");
    expect(iso(parseLocaleDate(formatDate(d(2026, 6, 9), "en-US"), "en-US"))).toBe("2026-06-09");
  });

  it("round-trips formatDate for several locales", () => {
    for (const locale of ["en-US", "en-GB", "de-DE", "fr-FR", "ja-JP", "ar-EG", "es-ES"]) {
      for (const style of ["short", "medium", "long"] as const) {
        const text = formatDate(d(2026, 11, 15), locale, { dateStyle: style });
        expect(iso(parseLocaleDate(text, locale)), `${locale} ${style}: ${text}`).toBe("2026-11-15");
      }
    }
  });

  it("rejects garbage and impossible dates", () => {
    expect(parseLocaleDate("hello", "en-US")).toBeNull();
    expect(parseLocaleDate("", "en-US")).toBeNull();
    expect(parseLocaleDate("2/30/2026", "en-US")).toBeNull();
    expect(parseLocaleDate("13/13/2026", "en-US")).toBeNull();
    expect(parseLocaleDate("Foo 15, 2026", "en-US")).toBeNull();
  });
});

describe("getYearRange", () => {
  it("expands around a year and clamps to min/max", () => {
    expect(getYearRange(2026, 10)).toEqual([2016, 2036]);
    expect(getYearRange(2026, [2000, 2030])).toEqual([2000, 2030]);
    expect(getYearRange(2026, 10, d(2020, 1, 1), d(2028, 1, 1))).toEqual([2020, 2028]);
  });
});

describe("time helpers", () => {
  it("parseTime / formatTimeValue", () => {
    expect(parseTime("09:05")).toEqual({ hours: 9, minutes: 5 });
    expect(parseTime("9:05")).toEqual({ hours: 9, minutes: 5 });
    expect(parseTime("24:00")).toBeNull();
    expect(parseTime("12:60")).toBeNull();
    expect(parseTime("noon")).toBeNull();
    expect(formatTimeValue({ hours: 9, minutes: 5 })).toBe("09:05");
    expect(timeToMinutes({ hours: 10, minutes: 30 })).toBe(630);
  });

  it("hour cycle and day periods per locale", () => {
    expect(getHourCycle("en-US")).toBe("h12");
    expect(getHourCycle("de-DE")).toBe("h23");
    expect(prefersTwelveHourClock("en-US")).toBe(true);
    expect(prefersTwelveHourClock("de-DE")).toBe(false);
    expect(getDayPeriodNames("en-US")).toEqual(["AM", "PM"]);
    expect(getDayPeriodNames("ja-JP")).toEqual(["午前", "午後"]);
    const [am, pm] = getDayPeriodNames("ar-EG");
    expect(am).not.toBe(pm);
  });

  it("formatTime", () => {
    expect(formatTime({ hours: 22, minutes: 30 }, "en-US", true)).toMatch(/^10:30\sPM$/);
    expect(formatTime({ hours: 22, minutes: 30 }, "en-US", false)).toBe("22:30");
    expect(formatTime({ hours: 0, minutes: 5 }, "de-DE", false)).toBe("00:05");
  });

  it("parseTimeInput accepts 24h, 12h and localized day periods", () => {
    expect(parseTimeInput("22:30", "en-US")).toEqual({ hours: 22, minutes: 30 });
    expect(parseTimeInput("10:30 pm", "en-US")).toEqual({ hours: 22, minutes: 30 });
    expect(parseTimeInput("10:30 P.M.", "en-US")).toEqual({ hours: 22, minutes: 30 });
    expect(parseTimeInput("12:15 AM", "en-US")).toEqual({ hours: 0, minutes: 15 });
    expect(parseTimeInput("12:15 PM", "en-US")).toEqual({ hours: 12, minutes: 15 });
    expect(parseTimeInput("7 am", "en-US")).toEqual({ hours: 7, minutes: 0 });
    expect(parseTimeInput("1030", "en-US")).toEqual({ hours: 10, minutes: 30 });
    expect(parseTimeInput("午後10:30", "ja-JP")).toEqual({ hours: 22, minutes: 30 });
    expect(parseTimeInput(formatTime({ hours: 21, minutes: 5 }, "ar-EG", true), "ar-EG")).toEqual({
      hours: 21,
      minutes: 5,
    });
    expect(parseTimeInput(formatTime({ hours: 21, minutes: 5 }, "en-US", true), "en-US")).toEqual({
      hours: 21,
      minutes: 5,
    });
  });

  it("parseTimeInput rejects invalid input", () => {
    expect(parseTimeInput("25:00", "en-US")).toBeNull();
    expect(parseTimeInput("13:00 pm", "en-US")).toBeNull();
    expect(parseTimeInput("abc", "en-US")).toBeNull();
    expect(parseTimeInput("", "en-US")).toBeNull();
    expect(parseTimeInput("1:2:3", "en-US")).toBeNull();
  });
});

describe("getTextDirection", () => {
  it("detects right-to-left locales", () => {
    expect(getTextDirection("ar-EG")).toBe("rtl");
    expect(getTextDirection("he")).toBe("rtl");
    expect(getTextDirection("en-US")).toBe("ltr");
    expect(getTextDirection("ja-JP")).toBe("ltr");
    expect(getTextDirection("???")).toBe("ltr");
  });
});
