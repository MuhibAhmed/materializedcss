"use client";

import * as React from "react";

import { ArrowDropDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { useControllableState } from "@/hooks/use-controllable-state";
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compareDays,
  endOfMonth,
  endOfWeek,
  getCalendarMatrix,
  getDefaultLocale,
  getFirstDayOfWeek,
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
  startOfMonth,
  startOfWeek,
  toISODateString,
  type NameFormat,
  type Weekday,
} from "@/lib/date";
import { cn } from "@/lib/utils";

/** A selected range of days. `to` is `null` while the end is still being picked. */
export interface DateRange {
  from: Date | null;
  to: Date | null;
}

/** Text used by the calendar's controls (all have English defaults). */
export interface CalendarLabels {
  previousMonth?: string;
  nextMonth?: string;
  previousYear?: string;
  nextYear?: string;
  /** Suffix read after the month caption on the header button. */
  chooseYear?: string;
  /** Accessible name of the year list. */
  year?: string;
  /** Accessible name of the month list. */
  month?: string;
  /** Read after a day that has events. */
  hasEvents?: string;
}

const DEFAULT_LABELS: Required<CalendarLabels> = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
  previousYear: "Previous year",
  nextYear: "Next year",
  chooseYear: "choose month and year",
  year: "Year",
  month: "Month",
  hasEvents: "has events",
};

interface CalendarBaseProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange" | "onSelect" | "children"> {
  /** The month shown (controlled). Any day in the month works. */
  month?: Date;
  /** The month shown first (uncontrolled). Defaults to the selected day or today. */
  defaultMonth?: Date;
  /** Called when the visible month changes. */
  onMonthChange?: (month: Date) => void;
  /** Earliest selectable day. Navigation before its month is disabled. */
  minDate?: Date | null;
  /** Latest selectable day. Navigation after its month is disabled. */
  maxDate?: Date | null;
  /** Return `true` to disable a day. */
  disabledDays?: (date: Date) => boolean;
  /** Disable Saturdays and Sundays. */
  disableWeekends?: boolean;
  /** First column of the grid (0 = Sunday … 6 = Saturday). Defaults to the locale's first day. */
  firstDayOfWeek?: Weekday;
  /** BCP 47 locale for names, digits and direction. Defaults to `navigator.language` ("en-US" during SSR). */
  locale?: string;
  /** Show (and allow picking) days of the previous and next month. */
  showOutsideDays?: boolean;
  /** Days marked with a dot (Materialize `events`). */
  events?: readonly Date[];
  /** Years in the year picker: `n` years either side of today, or an explicit `[from, to]`. */
  yearRange?: number | readonly [number, number];
  /** Width of the weekday names in the header row. */
  weekdayFormat?: NameFormat;
  /** Move keyboard focus to the active day when the calendar mounts. */
  autoFocus?: boolean;
  /** Override control labels (i18n). */
  labels?: CalendarLabels;
}

/** Single-date calendar props. */
export interface CalendarSingleProps extends CalendarBaseProps {
  /** Pick one day (default). */
  mode?: "single";
  /** Selected day (controlled). `null` means nothing selected. */
  value?: Date | null;
  /** Initially selected day (uncontrolled). */
  defaultValue?: Date | null;
  /** Called with the picked day. */
  onValueChange?: (value: Date | null) => void;
}

/** Date-range calendar props. */
export interface CalendarRangeProps extends CalendarBaseProps {
  /** Pick a start and an end day. */
  mode: "range";
  /** Selected range (controlled). */
  value?: DateRange;
  /** Initially selected range (uncontrolled). */
  defaultValue?: DateRange;
  /** Called after each click: first with `{ from, to: null }`, then with the full range. */
  onValueChange?: (value: DateRange) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

type CalendarView = "days" | "months" | "years";

const subscribeNoop = (): (() => void) => () => {};

/** `navigator.language` after hydration, "en-US" on the server (no hydration mismatch). */
function useResolvedLocale(locale: string | undefined): string {
  const detected = React.useSyncExternalStore(subscribeNoop, getDefaultLocale, () => "en-US");
  return locale ?? detected;
}

/** Today's ISO day on the client, `null` during SSR. */
function useTodayKey(): string | null {
  return React.useSyncExternalStore(
    subscribeNoop,
    () => toISODateString(new Date()),
    () => null,
  );
}

const EMPTY_RANGE: DateRange = { from: null, to: null };

/**
 * Materialize's datepicker calendar as a standalone, accessible date grid.
 * Single or range selection, min/max and disabled days, locale-aware names,
 * first day of week and direction, event dots, and a built-in month/year view.
 */
export function Calendar(props: CalendarProps): React.JSX.Element {
  const {
    mode: _mode,
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    minDate,
    maxDate,
    disabledDays,
    disableWeekends,
    firstDayOfWeek: firstDayProp,
    locale: localeProp,
    showOutsideDays = false,
    events,
    yearRange = 100,
    weekdayFormat = "narrow",
    autoFocus = false,
    labels: labelsProp,
    className,
    dir: dirProp,
    ...rootProps
  } = props;

  const isRange = props.mode === "range";
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const locale = useResolvedLocale(localeProp);
  const firstDayOfWeek = firstDayProp ?? getFirstDayOfWeek(locale);
  const dir = dirProp ?? getTextDirection(locale);
  const todayKey = useTodayKey();
  const id = React.useId();

  const [selected, setSelected] = useControllableState<Date | null>({
    value: props.mode === "range" ? undefined : props.value,
    defaultValue: props.mode === "range" ? null : (props.defaultValue ?? null),
    onChange: props.mode === "range" ? undefined : props.onValueChange,
  });
  const [range, setRange] = useControllableState<DateRange>({
    value: props.mode === "range" ? props.value : undefined,
    defaultValue: props.mode === "range" ? (props.defaultValue ?? EMPTY_RANGE) : EMPTY_RANGE,
    onChange: props.mode === "range" ? props.onValueChange : undefined,
  });

  const anchorDate = isRange ? (range.from ?? null) : selected;
  const [initialToday] = React.useState(() => new Date());
  const [month, setMonthState] = useControllableState<Date>({
    value: monthProp ? startOfMonth(monthProp) : undefined,
    defaultValue: startOfMonth(defaultMonth ?? anchorDate ?? clampDate(initialToday, minDate, maxDate)),
    onChange: onMonthChange,
  });
  const setMonth = React.useCallback(
    (next: Date) => {
      if (!isSameMonth(next, month)) setMonthState(startOfMonth(next));
    },
    [month, setMonthState],
  );

  const [view, setView] = React.useState<CalendarView>("days");
  const [focusDate, setFocusDate] = React.useState<Date | null>(null);
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const pendingFocus = React.useRef<"day" | "year" | "month" | null>(autoFocus ? "day" : null);
  const gridRef = React.useRef<HTMLTableElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const constraints = React.useMemo(
    () => ({ minDate, maxDate, disabledDays, disableWeekends }),
    [minDate, maxDate, disabledDays, disableWeekends],
  );

  const today = React.useMemo(() => (todayKey ? new Date(`${todayKey}T00:00:00`) : null), [todayKey]);

  // The day that owns the roving tabindex: the focused day if it is in view,
  // else the selection, today, or the first enabled day of the month.
  const activeDate = React.useMemo((): Date => {
    if (focusDate && isSameMonth(focusDate, month)) return focusDate;
    const candidates = [isRange ? range.from : selected, isRange ? range.to : null, today];
    for (const candidate of candidates) {
      if (candidate && isSameMonth(candidate, month)) return candidate;
    }
    let day = startOfMonth(month);
    const last = endOfMonth(month);
    while (compareDays(day, last) <= 0) {
      if (!isDateDisabled(day, constraints)) return day;
      day = addDays(day, 1);
    }
    return startOfMonth(month);
  }, [focusDate, month, isRange, range, selected, today, constraints]);

  const formatters = React.useMemo(
    () => ({
      day: new Intl.NumberFormat(locale, { useGrouping: false }),
      full: new Intl.DateTimeFormat(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      caption: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
      year: new Intl.DateTimeFormat(locale, { year: "numeric" }),
    }),
    [locale],
  );
  const weekdayShort = React.useMemo(
    () => getWeekdayNames(locale, weekdayFormat, firstDayOfWeek),
    [locale, weekdayFormat, firstDayOfWeek],
  );
  const weekdayLong = React.useMemo(() => getWeekdayNames(locale, "long", firstDayOfWeek), [locale, firstDayOfWeek]);
  const monthNamesShort = React.useMemo(() => getMonthNames(locale, "short"), [locale]);
  const monthNamesLong = React.useMemo(() => getMonthNames(locale, "long"), [locale]);
  const weeks = React.useMemo(() => getCalendarMatrix(month, firstDayOfWeek), [month, firstDayOfWeek]);
  const eventKeys = React.useMemo(() => new Set((events ?? []).map(toISODateString)), [events]);
  const caption = formatters.caption.format(month);

  const prevDisabled = Boolean(minDate && isBeforeDay(endOfMonth(addMonths(month, -1)), minDate));
  const nextDisabled = Boolean(maxDate && isAfterDay(startOfMonth(addMonths(month, 1)), maxDate));
  const prevYearDisabled = Boolean(minDate && month.getFullYear() - 1 < minDate.getFullYear());
  const nextYearDisabled = Boolean(maxDate && month.getFullYear() + 1 > maxDate.getFullYear());

  const announce = (next: Date): void => setAnnouncement(formatters.caption.format(next));

  const goToMonth = (next: Date): void => {
    setMonth(next);
    announce(next);
  };

  const moveFocus = (next: Date): void => {
    const target = clampDate(next, minDate, maxDate);
    setFocusDate(target);
    if (!isSameMonth(target, month)) goToMonth(target);
    pendingFocus.current = "day";
  };

  // Focus whatever the last keyboard action asked for, once it has rendered.
  React.useEffect(() => {
    const request = pendingFocus.current;
    if (!request) return;
    pendingFocus.current = null;
    if (request === "day") {
      gridRef.current?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus();
      return;
    }
    const list = listRef.current;
    const option = list?.querySelector<HTMLElement>('[role="option"][tabindex="0"]');
    if (list && option) {
      list.scrollTop = option.offsetTop - list.clientHeight / 2 + option.offsetHeight / 2;
      option.focus({ preventScroll: true });
    }
  });

  const selectDay = (day: Date): void => {
    if (isDateDisabled(day, constraints)) return;
    setFocusDate(day);
    if (!isSameMonth(day, month)) goToMonth(day);
    if (!isRange) {
      setSelected(day);
      return;
    }
    if (!range.from || range.to) {
      setRange({ from: day, to: null });
    } else if (isBeforeDay(day, range.from)) {
      setRange({ from: day, to: range.from });
    } else {
      setRange({ from: range.from, to: day });
    }
    setHoverDate(null);
  };

  const onGridKeyDown = (event: React.KeyboardEvent<HTMLTableElement>): void => {
    const rtl = dir === "rtl";
    let next: Date | null = null;
    switch (event.key) {
      case "ArrowLeft":
        next = addDays(activeDate, rtl ? 1 : -1);
        break;
      case "ArrowRight":
        next = addDays(activeDate, rtl ? -1 : 1);
        break;
      case "ArrowUp":
        next = addDays(activeDate, -7);
        break;
      case "ArrowDown":
        next = addDays(activeDate, 7);
        break;
      case "PageUp":
        next = event.shiftKey ? addYears(activeDate, -1) : addMonths(activeDate, -1);
        break;
      case "PageDown":
        next = event.shiftKey ? addYears(activeDate, 1) : addMonths(activeDate, 1);
        break;
      case "Home":
        next = startOfWeek(activeDate, firstDayOfWeek);
        break;
      case "End":
        next = endOfWeek(activeDate, firstDayOfWeek);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        selectDay(activeDate);
        return;
      default:
        return;
    }
    event.preventDefault();
    moveFocus(next);
  };

  /* ---------------------------------- month / year views ---------------------------------- */

  const [yearFrom, yearTo] = getYearRange(
    (anchorDate ?? today ?? initialToday).getFullYear(),
    yearRange,
    minDate,
    maxDate,
  );
  const years = React.useMemo(
    () => Array.from({ length: yearTo - yearFrom + 1 }, (_, index) => yearFrom + index),
    [yearFrom, yearTo],
  );

  const isMonthDisabled = (year: number, monthIndex: number): boolean => {
    const first = new Date(year, monthIndex, 1);
    if (minDate && isBeforeDay(endOfMonth(first), minDate)) return true;
    if (maxDate && isAfterDay(first, maxDate)) return true;
    return false;
  };

  const openView = (next: CalendarView): void => {
    setView(next);
    pendingFocus.current = next === "days" ? "day" : next === "years" ? "year" : "month";
  };

  const pickYear = (year: number): void => {
    const target = clampDate(new Date(year, month.getMonth(), 1), minDate ? startOfMonth(minDate) : null, maxDate);
    const day = Math.min(activeDate.getDate(), endOfMonth(target).getDate());
    setFocusDate(new Date(target.getFullYear(), target.getMonth(), day));
    goToMonth(target);
    openView("months");
  };

  const pickMonth = (monthIndex: number): void => {
    const target = new Date(month.getFullYear(), monthIndex, 1);
    const day = Math.min(activeDate.getDate(), endOfMonth(target).getDate());
    goToMonth(target);
    setFocusDate(clampDate(new Date(target.getFullYear(), monthIndex, day), minDate, maxDate));
    openView("days");
  };

  /** Arrow-key roving focus for the year and month option lists. */
  const onListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, columns: number): void => {
    const options = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="option"]'));
    const current = options.indexOf(event.target as HTMLElement);
    if (current === -1) return;
    const rtl = dir === "rtl";
    let step = 0;
    switch (event.key) {
      case "ArrowLeft":
        step = rtl ? 1 : -1;
        break;
      case "ArrowRight":
        step = rtl ? -1 : 1;
        break;
      case "ArrowUp":
        step = -columns;
        break;
      case "ArrowDown":
        step = columns;
        break;
      case "Home":
        step = -current;
        break;
      case "End":
        step = options.length - 1 - current;
        break;
      case "Escape":
        if (view !== "days") {
          event.preventDefault();
          openView("days");
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    const direction = Math.sign(step) || 1;
    let index = current + step;
    while (index >= 0 && index < options.length && options[index]?.getAttribute("aria-disabled") === "true") {
      index += direction;
    }
    const target = options[index];
    if (!target) return;
    for (const option of options) option.tabIndex = option === target ? 0 : -1;
    target.focus();
  };

  /* --------------------------------------- render --------------------------------------- */

  const headerButton = cn(
    "relative inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground",
    "outline-none transition-colors hover:bg-surface-hover focus-visible:focus-ring",
    "disabled:pointer-events-none disabled:text-disabled-foreground [&_svg]:size-6 rtl:[&_svg]:-scale-x-100",
  );

  // Range band: the committed range, or a preview from `from` to the hovered day.
  let band: { from: Date; to: Date; preview: boolean } | null = null;
  if (isRange && range.from) {
    const end = range.to ?? hoverDate;
    if (end && !isSameDay(end, range.from)) {
      band =
        compareDays(range.from, end) <= 0
          ? { from: range.from, to: end, preview: !range.to }
          : { from: end, to: range.from, preview: !range.to };
    }
  }

  const showNav = view !== "years";
  const onPrev = (): void => {
    if (view === "months") goToMonth(addYears(month, -1));
    else goToMonth(addMonths(month, -1));
  };
  const onNext = (): void => {
    if (view === "months") goToMonth(addYears(month, 1));
    else goToMonth(addMonths(month, 1));
  };

  return (
    <div
      data-slot="calendar"
      data-view={view}
      dir={dir}
      lang={locale}
      className={cn("inline-block w-[296px] select-none bg-surface p-2 text-foreground", className)}
      {...rootProps}
    >
      <div data-slot="calendar-header" className="flex h-12 items-center justify-between">
        {showNav ? (
          <button
            type="button"
            data-slot="calendar-prev"
            className={headerButton}
            disabled={view === "months" ? prevYearDisabled : prevDisabled}
            aria-label={view === "months" ? labels.previousYear : labels.previousMonth}
            onClick={onPrev}
          >
            <ChevronLeftIcon />
          </button>
        ) : (
          <span className="size-10" />
        )}
        <button
          type="button"
          id={`${id}-caption`}
          data-slot="calendar-caption"
          aria-expanded={view !== "days"}
          onClick={() => openView(view === "days" ? "years" : "days")}
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-0.5 rounded-ui px-2 text-base font-medium text-foreground",
            "outline-none transition-colors hover:bg-surface-hover focus-visible:focus-ring",
          )}
        >
          <span>{view === "months" ? formatters.year.format(month) : caption}</span>
          <span className="sr-only">, {labels.chooseYear}</span>
          <ArrowDropDownIcon
            className={cn("size-6 transition-transform duration-200", view !== "days" && "rotate-180")}
          />
        </button>
        {showNav ? (
          <button
            type="button"
            data-slot="calendar-next"
            className={headerButton}
            disabled={view === "months" ? nextYearDisabled : nextDisabled}
            aria-label={view === "months" ? labels.nextYear : labels.nextMonth}
            onClick={onNext}
          >
            <ChevronRightIcon />
          </button>
        ) : (
          <span className="size-10" />
        )}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {view === "days" ? (
        <table
          ref={gridRef}
          role="grid"
          data-slot="calendar-grid"
          aria-labelledby={`${id}-caption`}
          className="w-[280px] table-fixed border-collapse"
          onKeyDown={onGridKeyDown}
          onMouseLeave={() => setHoverDate(null)}
        >
          <thead>
            <tr>
              {weekdayShort.map((name, index) => (
                <th
                  key={weekdayLong[index]}
                  scope="col"
                  data-slot="calendar-weekday"
                  className="h-10 p-0 text-center text-sm font-normal text-muted-foreground"
                >
                  <span aria-hidden="true">{name}</span>
                  <span className="sr-only">{weekdayLong[index]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={toISODateString(week[0]!)}>
                {week.map((day) => {
                  const key = toISODateString(day);
                  const outside = !isSameMonth(day, month);
                  if (outside && !showOutsideDays) {
                    return <td key={key} role="gridcell" className="size-10 p-0" />;
                  }
                  const disabled = isDateDisabled(day, constraints);
                  const isToday = today ? isSameDay(day, today) : false;
                  const hasEvent = eventKeys.has(key);

                  const isEndpoint = isRange
                    ? isSameDay(day, range.from) || isSameDay(day, range.to)
                    : isSameDay(day, selected);
                  const banded = band ? isDayInRange(day, band.from, band.to) : false;
                  const inRange = banded && !band?.preview;
                  const isSelected = isEndpoint || inRange;
                  const bandStart = banded && isSameDay(day, band?.from);
                  const bandEnd = banded && isSameDay(day, band?.to);
                  const previewEnd = Boolean(band?.preview && isSameDay(day, hoverDate));
                  const active = isSameDay(day, activeDate);

                  return (
                    <td
                      key={key}
                      role="gridcell"
                      data-slot="calendar-day"
                      data-date={key}
                      data-outside={outside || undefined}
                      data-today={isToday || undefined}
                      data-selected={isSelected || undefined}
                      data-range-start={(isRange && isSameDay(day, range.from)) || undefined}
                      data-range-end={(isRange && isSameDay(day, range.to)) || undefined}
                      data-in-range={inRange || undefined}
                      tabIndex={active ? 0 : -1}
                      aria-selected={isSelected}
                      aria-disabled={disabled || undefined}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={`${formatters.full.format(day)}${hasEvent ? `, ${labels.hasEvents}` : ""}`}
                      onClick={() => selectDay(day)}
                      onFocus={() => setFocusDate(day)}
                      onMouseEnter={isRange && range.from && !range.to ? () => setHoverDate(day) : undefined}
                      className={cn(
                        "group relative size-10 p-0 text-center align-middle outline-none",
                        disabled ? "cursor-default" : "cursor-pointer",
                        banded && (band?.preview ? "bg-secondary-light/60" : "bg-secondary-light"),
                        bandStart && "rounded-s-full",
                        bandEnd && "rounded-e-full",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "relative mx-auto flex size-10 items-center justify-center rounded-full text-sm transition-colors duration-150",
                          "group-focus-visible:focus-ring",
                          !isEndpoint && !disabled && "group-hover:bg-surface-hover group-focus-visible:bg-secondary/20",
                          isToday && !isEndpoint && "font-medium text-secondary",
                          outside && !isEndpoint && "text-muted-foreground",
                          disabled && "text-disabled-foreground",
                          isEndpoint && "bg-secondary font-medium text-secondary-foreground",
                          isEndpoint && disabled && "bg-disabled",
                          previewEnd && !isEndpoint && "ring-1 ring-secondary ring-inset",
                        )}
                      >
                        {formatters.day.format(day.getDate())}
                        {hasEvent ? (
                          <span
                            data-slot="calendar-event"
                            className={cn(
                              "absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full",
                              isEndpoint ? "bg-secondary-foreground" : "bg-secondary",
                            )}
                          />
                        ) : null}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : view === "years" ? (
        <div
          ref={listRef}
          role="listbox"
          aria-label={labels.year}
          data-slot="calendar-years"
          className="relative grid h-[280px] w-[280px] grid-cols-4 content-start gap-y-1 overflow-y-auto overscroll-contain py-1"
          onKeyDown={(event) => onListKeyDown(event, 4)}
        >
          {years.map((year) => {
            const isCurrent = year === month.getFullYear();
            const isThisYear = today?.getFullYear() === year;
            return (
              <div
                key={year}
                role="option"
                aria-selected={isCurrent}
                tabIndex={isCurrent ? 0 : -1}
                onClick={() => pickYear(year)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    pickYear(year);
                  }
                }}
                className={cn(
                  "mx-auto flex h-9 w-16 cursor-pointer items-center justify-center rounded-full text-sm outline-none transition-colors",
                  "hover:bg-surface-hover focus-visible:focus-ring",
                  isThisYear && !isCurrent && "font-medium text-secondary",
                  isCurrent && "bg-secondary font-medium text-secondary-foreground hover:bg-secondary",
                )}
              >
                {formatters.year.format(new Date(year, 0, 1))}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          ref={listRef}
          role="listbox"
          aria-label={labels.month}
          data-slot="calendar-months"
          className="relative grid h-[280px] w-[280px] grid-cols-3 content-center gap-y-4"
          onKeyDown={(event) => onListKeyDown(event, 3)}
        >
          {monthNamesShort.map((name, index) => {
            const isCurrent = index === month.getMonth();
            const disabled = isMonthDisabled(month.getFullYear(), index);
            return (
              <div
                key={monthNamesLong[index]}
                role="option"
                aria-selected={isCurrent}
                aria-disabled={disabled || undefined}
                aria-label={monthNamesLong[index]}
                tabIndex={isCurrent ? 0 : -1}
                onClick={() => !disabled && pickMonth(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (!disabled) pickMonth(index);
                  }
                }}
                className={cn(
                  "mx-auto flex h-10 w-20 items-center justify-center rounded-full text-sm uppercase outline-none transition-colors",
                  "focus-visible:focus-ring",
                  disabled ? "cursor-default text-disabled-foreground" : "cursor-pointer hover:bg-surface-hover",
                  isCurrent && !disabled && "bg-secondary font-medium text-secondary-foreground hover:bg-secondary",
                )}
              >
                {name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
