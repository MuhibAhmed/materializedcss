"use client";

import * as React from "react";
import { Popover } from "radix-ui";

import { Button } from "@/components/ui/button";
import { Calendar, type CalendarLabels } from "@/components/ui/calendar";
import { CalendarIcon } from "@/components/ui/icons";
import {
  PickerFooter,
  PickerIconButton,
  PickerInput,
  PickerModal,
  mergePickerRefs,
  usePickerLocale,
} from "@/components/ui/picker-input";
import { useControllableState } from "@/hooks/use-controllable-state";
import {
  formatDate as formatDateIntl,
  getTextDirection,
  isDateDisabled,
  isSameDay,
  parseLocaleDate,
  toISODateString,
  type Weekday,
} from "@/lib/date";
import { cn, composeEventHandlers } from "@/lib/utils";

/** Button labels and accessible names (English defaults). */
export interface DatepickerI18n {
  cancel?: string;
  clear?: string;
  done?: string;
  /** Accessible name of the calendar icon button. */
  openPicker?: string;
  /** Accessible title of the dialog / popover. */
  title?: string;
  /** Labels passed to the calendar (month navigation, year picker). */
  calendar?: CalendarLabels;
}

const DEFAULT_I18N = {
  cancel: "Cancel",
  clear: "Clear",
  done: "Ok",
  openPicker: "Choose date",
  title: "Select date",
} as const;

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };

export interface DatepickerProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "size" | "children" | "name"
  > {
  /** Selected day (controlled). `null` clears it. */
  value?: Date | null;
  /** Initially selected day (uncontrolled). */
  defaultValue?: Date | null;
  /** Called when a day is committed (OK, auto close, typing, or Clear with `null`). */
  onValueChange?: (value: Date | null) => void;
  /** Whether the picker is open (controlled). */
  open?: boolean;
  /** Initially open (uncontrolled). */
  defaultOpen?: boolean;
  /** Called on every open and close, including Esc, overlay click, Cancel and OK. */
  onOpenChange?: (open: boolean) => void;
  /** `modal` (Materialize dialog with date header and buttons) or `popover` (calendar anchored to the field). */
  variant?: "modal" | "popover";
  /** Floating label. */
  label?: React.ReactNode;
  /** Small text under the field. */
  helperText?: React.ReactNode;
  /** `Intl.DateTimeFormat` options for the field text. Default: `{ year: "numeric", month: "short", day: "numeric" }`. */
  format?: Intl.DateTimeFormatOptions;
  /** Custom formatter for the field text (overrides `format`). */
  formatDate?: (date: Date, locale: string) => string;
  /** Parse typed text. Defaults to a locale-aware parser that accepts numeric, ISO and month-name dates. */
  parseDate?: (text: string, locale: string) => Date | null;
  /** Commit and close as soon as a day is picked (modal only; popovers always close). */
  autoClose?: boolean;
  /** Show the Clear button. */
  showClearBtn?: boolean;
  /** Button labels and accessible names. */
  i18n?: DatepickerI18n;
  /** Earliest selectable day. */
  minDate?: Date | null;
  /** Latest selectable day. */
  maxDate?: Date | null;
  /** Return `true` to disable a day. */
  disabledDays?: (date: Date) => boolean;
  /** Disable Saturdays and Sundays. */
  disableWeekends?: boolean;
  /** First column of the calendar (0 = Sunday). Defaults to the locale's. */
  firstDayOfWeek?: Weekday;
  /** BCP 47 locale. Defaults to `navigator.language`. */
  locale?: string;
  /** Years in the year picker: `n` either side of today or `[from, to]`. */
  yearRange?: number | readonly [number, number];
  /** Show days of adjacent months in the calendar. */
  showOutsideDays?: boolean;
  /** Days marked with a dot. */
  events?: readonly Date[];
  /** Name of a hidden input that submits the value as `yyyy-mm-dd`. */
  name?: string;
  /** Open the picker when the field is clicked (Materialize behavior). Typing still works with the keyboard. */
  openOnClick?: boolean;
  /** Show the calendar icon button at the end of the field. */
  showIcon?: boolean;
  /** Color of the modal's date header. */
  headerColor?: "secondary" | "primary";
  /** Class name for the `<input>` (`className` styles the field wrapper). */
  inputClassName?: string;
  /** Class name for the modal or popover content. */
  contentClassName?: string;
}

/**
 * Materialize datepicker: a text field that opens a modal calendar (with the
 * big date header and Clear / Cancel / OK) or an anchored popover. Typing a
 * date works too, and the value is submitted as `yyyy-mm-dd`.
 */
export function Datepicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  variant = "modal",
  label,
  helperText,
  format,
  formatDate,
  parseDate,
  autoClose = false,
  showClearBtn = false,
  i18n,
  minDate,
  maxDate,
  disabledDays,
  disableWeekends,
  firstDayOfWeek,
  locale: localeProp,
  yearRange,
  showOutsideDays,
  events,
  name,
  openOnClick = true,
  showIcon = true,
  headerColor = "secondary",
  className,
  inputClassName,
  contentClassName,
  disabled = false,
  readOnly = false,
  ref,
  id: idProp,
  dir: dirProp,
  onClick,
  onKeyDown,
  onBlur,
  ...inputProps
}: DatepickerProps): React.JSX.Element {
  const locale = usePickerLocale(localeProp);
  const dir = dirProp ?? getTextDirection(locale);
  const text = { ...DEFAULT_I18N, ...i18n };
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fieldRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const interactedOutside = React.useRef(false);
  const interactive = !disabled && !readOnly;

  const [value, setValue] = useControllableState<Date | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });
  const [open, setOpenState] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const constraints = { minDate, maxDate, disabledDays, disableWeekends };
  const display = React.useCallback(
    (date: Date | null): string => {
      if (!date) return "";
      return formatDate ? formatDate(date, locale) : formatDateIntl(date, locale, format ?? DEFAULT_FORMAT);
    },
    [formatDate, format, locale],
  );
  const parse = (input: string): Date | null => (parseDate ? parseDate(input, locale) : parseLocaleDate(input, locale));

  // Field text: follows the value, but keeps what the user is typing until it is committed.
  const displayed = display(value);
  const [inputText, setInputText] = React.useState(displayed);
  const [lastDisplayed, setLastDisplayed] = React.useState(displayed);
  if (lastDisplayed !== displayed) {
    setLastDisplayed(displayed);
    setInputText(displayed);
  }

  const commit = (next: Date | null): void => {
    if (next && value && isSameDay(next, value)) {
      setInputText(displayed);
      return;
    }
    setValue(next);
    setInputText(display(next));
  };

  /** Apply typed text. Returns the resulting value. */
  const commitText = (): Date | null => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      if (value) commit(null);
      return null;
    }
    const parsed = parse(trimmed);
    if (parsed && !isDateDisabled(parsed, constraints)) {
      commit(parsed);
      return parsed;
    }
    setInputText(displayed);
    return value;
  };

  // The modal edits a draft; OK commits it (Materialize behavior).
  const [draft, setDraft] = React.useState<Date | null>(value);

  const setOpen = (next: boolean): void => {
    if (next && !interactive) return;
    if (next && !open) {
      // Respect what is typed in the field (fixes Materialize #6575).
      setDraft(commitText());
      interactedOutside.current = false;
    }
    setOpenState(next);
  };

  const focusActiveDay = (event: Event): void => {
    event.preventDefault();
    contentRef.current?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus();
  };
  const returnFocus = (event: Event): void => {
    event.preventDefault();
    if (!interactedOutside.current) inputRef.current?.focus();
    interactedOutside.current = false;
  };

  const calendarProps = {
    locale,
    minDate,
    maxDate,
    disabledDays,
    disableWeekends,
    firstDayOfWeek,
    yearRange,
    showOutsideDays,
    events,
    labels: i18n?.calendar,
  };

  const iconButton = showIcon ? (
    <PickerIconButton
      aria-label={text.openPicker}
      aria-haspopup="dialog"
      aria-expanded={open}
      disabled={!interactive}
      onClick={() => setOpen(true)}
    >
      <CalendarIcon />
    </PickerIconButton>
  ) : undefined;

  const field = (
    <PickerInput
      {...inputProps}
      ref={mergePickerRefs(ref, inputRef)}
      id={id}
      type="text"
      autoComplete="off"
      label={label}
      helperText={helperText}
      value={inputText}
      disabled={disabled}
      readOnly={readOnly}
      aria-haspopup="dialog"
      className={inputClassName}
      endAdornment={iconButton}
      onChange={(event) => setInputText(event.target.value)}
      onClick={composeEventHandlers(onClick, () => {
        if (openOnClick) setOpen(true);
      })}
      onKeyDown={composeEventHandlers(onKeyDown, (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") commitText();
        else if (event.key === "ArrowDown" && event.altKey) {
          event.preventDefault();
          setOpen(true);
        }
      })}
      onBlur={composeEventHandlers(onBlur, () => {
        if (!open) commitText();
      })}
    />
  );

  const hidden = name ? (
    <input type="hidden" name={name} value={value ? toISODateString(value) : ""} disabled={disabled} />
  ) : null;

  if (variant === "popover") {
    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <div ref={fieldRef} data-slot="datepicker" dir={dir} className={cn("relative w-full", className)}>
            {field}
            {hidden}
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            ref={contentRef}
            data-slot="datepicker-popover"
            role="dialog"
            aria-label={text.title}
            dir={dir}
            side="bottom"
            align="start"
            sideOffset={4}
            collisionPadding={8}
            onOpenAutoFocus={focusActiveDay}
            onCloseAutoFocus={returnFocus}
            onInteractOutside={(event) => {
              if (fieldRef.current?.contains(event.target as Node)) {
                event.preventDefault();
                return;
              }
              interactedOutside.current = true;
            }}
            className={cn(
              "z-50 origin-(--radix-popover-content-transform-origin) rounded-ui bg-surface shadow-z2 outline-none",
              "data-[state=closed]:animate-md-scale-out data-[state=open]:animate-md-scale-in motion-reduce:animate-none",
              contentClassName,
            )}
          >
            <Calendar
              {...calendarProps}
              value={value}
              onValueChange={(next) => {
                commit(next);
                setOpen(false);
              }}
            />
            {showClearBtn ? (
              <PickerFooter className="pt-0">
                <Button
                  variant="flat"
                  color="error"
                  size="sm"
                  data-clear=""
                  onClick={() => {
                    commit(null);
                    setOpen(false);
                  }}
                >
                  {text.clear}
                </Button>
              </PickerFooter>
            ) : null}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }

  const headerDate = draft ?? new Date();
  const headerYear = new Intl.DateTimeFormat(locale, { year: "numeric" }).format(headerDate);
  const headerText = new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" }).format(
    headerDate,
  );

  return (
    <div ref={fieldRef} data-slot="datepicker" dir={dir} className={cn("relative w-full", className)}>
      {field}
      {hidden}
      <PickerModal
        ref={contentRef}
        open={open}
        onOpenChange={setOpen}
        title={text.title}
        dir={dir}
        onOpenAutoFocus={focusActiveDay}
        onCloseAutoFocus={returnFocus}
        className={cn("max-w-[328px] min-[601px]:max-w-[625px]", contentClassName)}
      >
        <div data-slot="datepicker-container" className="flex flex-col min-[601px]:flex-row">
          <div
            data-slot="datepicker-header"
            aria-hidden="true"
            className={cn(
              "shrink-0 px-[22px] py-5 font-medium min-[601px]:w-[270px]",
              headerColor === "primary" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
            )}
          >
            <div data-slot="datepicker-year" className="text-2xl leading-[25px] opacity-70">
              {headerYear}
            </div>
            <div data-slot="datepicker-date" className="mt-1 text-[2.8rem] leading-[47px] font-medium">
              {headerText}
            </div>
          </div>
          <div className="flex flex-1 flex-col items-center justify-between">
            <Calendar
              {...calendarProps}
              className="bg-transparent"
              value={draft}
              defaultMonth={draft ?? undefined}
              onValueChange={(next) => {
                setDraft(next);
                if (autoClose) {
                  commit(next);
                  setOpenState(false);
                }
              }}
            />
            <PickerFooter className="w-full">
              {showClearBtn ? (
                <Button
                  variant="flat"
                  color="error"
                  data-clear=""
                  onClick={() => {
                    commit(null);
                    setOpenState(false);
                  }}
                >
                  {text.clear}
                </Button>
              ) : null}
              <Button variant="flat" color="secondary" onClick={() => setOpenState(false)}>
                {text.cancel}
              </Button>
              <Button
                variant="flat"
                color="secondary"
                onClick={() => {
                  commit(draft);
                  setOpenState(false);
                }}
              >
                {text.done}
              </Button>
            </PickerFooter>
          </div>
        </div>
      </PickerModal>
    </div>
  );
}
