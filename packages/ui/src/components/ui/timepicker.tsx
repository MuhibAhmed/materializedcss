"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { ClockIcon } from "@/components/ui/icons";
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
  formatTime,
  formatTimeValue,
  getDayPeriodNames,
  getTextDirection,
  parseTime,
  parseTimeInput,
  prefersTwelveHourClock,
  timeToMinutes,
  type TimeValue,
} from "@/lib/date";
import { cn, composeEventHandlers } from "@/lib/utils";

/** Button labels and accessible names (English defaults). */
export interface TimepickerI18n {
  cancel?: string;
  clear?: string;
  done?: string;
  /** Accessible name of the clock icon button. */
  openPicker?: string;
  /** Accessible dialog title. */
  title?: string;
  /** Name of the hour spinbutton and hour dial. */
  hours?: string;
  /** Name of the minute spinbutton and minute dial. */
  minutes?: string;
}

const DEFAULT_I18N = {
  cancel: "Cancel",
  clear: "Clear",
  done: "Ok",
  openPicker: "Choose time",
  title: "Select time",
  hours: "Hours",
  minutes: "Minutes",
} as const;

// Materialize timepicker geometry (px).
const DIAL_RADIUS = 135;
const OUTER_RADIUS = 105;
const INNER_RADIUS = 70;
const TICK_RADIUS = 20;
const SWITCH_DELAY = 175;

export interface TimepickerProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "size" | "children" | "name" | "step"
  > {
  /** Selected time as 24-hour `"HH:mm"` (controlled). `null` clears it. */
  value?: string | null;
  /** Initial time (uncontrolled). */
  defaultValue?: string | null;
  /** Called with `"HH:mm"` (or `null`) when a time is committed. */
  onValueChange?: (value: string | null) => void;
  /** Whether the picker is open (controlled). */
  open?: boolean;
  /** Initially open (uncontrolled). */
  defaultOpen?: boolean;
  /** Called on every open and close, including Esc, overlay click, Cancel and OK. */
  onOpenChange?: (open: boolean) => void;
  /** Floating label. */
  label?: React.ReactNode;
  /** Small text under the field. */
  helperText?: React.ReactNode;
  /** 12-hour clock with AM/PM. Defaults to the locale's preference (`hourCycle`). */
  twelveHour?: boolean;
  /** BCP 47 locale for digits, AM/PM names and the field text. Defaults to `navigator.language`. */
  locale?: string;
  /** Minute granularity (1, 5, 10, 15…). */
  step?: number;
  /** Earliest selectable time, `"HH:mm"`. */
  minTime?: string;
  /** Latest selectable time, `"HH:mm"`. */
  maxTime?: string;
  /** Vibrate (where supported) when the dial value changes. Off by default. */
  vibrate?: boolean;
  /** Commit and close as soon as the minutes are picked on the dial. */
  autoClose?: boolean;
  /** Show the Clear button. */
  showClearBtn?: boolean;
  /** Time shown when opening without a value: `"now"` or `"HH:mm"`. */
  defaultTime?: string;
  /** Button labels and accessible names. */
  i18n?: TimepickerI18n;
  /** Name of a hidden input that submits the value as `HH:mm`. */
  name?: string;
  /** Open the picker when the field is clicked (Materialize behavior). */
  openOnClick?: boolean;
  /** Show the clock icon button at the end of the field. */
  showIcon?: boolean;
  /** Color of the modal's time header. */
  headerColor?: "secondary" | "primary";
  /** Class name for the `<input>` (`className` styles the field wrapper). */
  inputClassName?: string;
  /** Class name for the modal content. */
  contentClassName?: string;
}

type ClockView = "hours" | "minutes";

interface TimeRules {
  step: number;
  min: number;
  max: number;
}

const isMinuteAllowed = (hours: number, minutes: number, rules: TimeRules): boolean => {
  if (minutes % rules.step !== 0) return false;
  const total = hours * 60 + minutes;
  return total >= rules.min && total <= rules.max;
};

const isHourAllowed = (hours: number, rules: TimeRules): boolean => {
  for (let minutes = 0; minutes < 60; minutes += rules.step) {
    if (isMinuteAllowed(hours, minutes, rules)) return true;
  }
  return false;
};

/** Closest allowed time to `time` (same hour first), or `null` if nothing is allowed. */
function snapTime(time: TimeValue, rules: TimeRules): TimeValue | null {
  const target = timeToMinutes(time);
  let best: TimeValue | null = null;
  let bestDistance = Infinity;
  for (let hours = 0; hours < 24; hours += 1) {
    for (let minutes = 0; minutes < 60; minutes += rules.step) {
      if (!isMinuteAllowed(hours, minutes, rules)) continue;
      const distance = Math.abs(hours * 60 + minutes - target);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = { hours, minutes };
      }
    }
  }
  return best;
}

interface DialTick {
  value: number;
  label: string;
  radius: number;
  angle: number;
  showLabel: boolean;
}

/**
 * Materialize timepicker: a text field that opens a modal clock. The header
 * shows the big time with AM/PM toggles; pick the hour on the dial (or with
 * the keyboard), then the minutes. Value is a 24-hour `"HH:mm"` string.
 */
export function Timepicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  label,
  helperText,
  twelveHour: twelveHourProp,
  locale: localeProp,
  step: stepProp = 1,
  minTime,
  maxTime,
  vibrate = false,
  autoClose = false,
  showClearBtn = false,
  defaultTime = "now",
  i18n,
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
}: TimepickerProps): React.JSX.Element {
  const locale = usePickerLocale(localeProp);
  const dir = dirProp ?? getTextDirection(locale);
  const twelveHour = twelveHourProp ?? prefersTwelveHourClock(locale);
  const text = { ...DEFAULT_I18N, ...i18n };
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const interactive = !disabled && !readOnly;

  const step = Math.min(60, Math.max(1, Math.round(stepProp)));
  const rules: TimeRules = {
    step,
    min: minTime && parseTime(minTime) ? timeToMinutes(parseTime(minTime)!) : 0,
    max: maxTime && parseTime(maxTime) ? timeToMinutes(parseTime(maxTime)!) : 24 * 60 - 1,
  };
  const isAllowed = (time: TimeValue): boolean => isMinuteAllowed(time.hours, time.minutes, rules);

  const [value, setValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });
  const [open, setOpenState] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const time = parseTime(value);

  // Field text follows the value but keeps what the user types until it is committed.
  const displayed = time ? formatTime(time, locale, twelveHour) : "";
  const [inputText, setInputText] = React.useState(displayed);
  const [lastDisplayed, setLastDisplayed] = React.useState(displayed);
  if (lastDisplayed !== displayed) {
    setLastDisplayed(displayed);
    setInputText(displayed);
  }

  const commit = (next: TimeValue | null): void => {
    const formatted = next ? formatTimeValue(next) : null;
    if (formatted === value) {
      setInputText(displayed);
      return;
    }
    setValue(formatted);
    setInputText(next ? formatTime(next, locale, twelveHour) : "");
  };

  const commitText = (): TimeValue | null => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      if (value) commit(null);
      return null;
    }
    const parsed = parseTimeInput(trimmed, locale);
    if (parsed && isAllowed(parsed)) {
      commit(parsed);
      return parsed;
    }
    setInputText(displayed);
    return time;
  };

  const [draft, setDraft] = React.useState<TimeValue>({ hours: 0, minutes: 0 });
  const [view, setView] = React.useState<ClockView>("hours");

  const initialDraft = (from: TimeValue | null): TimeValue => {
    let base = from;
    if (!base) {
      const preset = defaultTime === "now" ? null : parseTime(defaultTime);
      const now = new Date();
      base = preset ?? { hours: now.getHours(), minutes: now.getMinutes() };
    }
    return isAllowed(base) ? base : (snapTime(base, rules) ?? base);
  };

  const setOpen = (next: boolean): void => {
    if (next && !interactive) return;
    if (next && !open) {
      setDraft(initialDraft(commitText()));
      setView("hours");
    }
    setOpenState(next);
  };

  const iconButton = showIcon ? (
    <PickerIconButton
      aria-label={text.openPicker}
      aria-haspopup="dialog"
      aria-expanded={open}
      disabled={!interactive}
      onClick={() => setOpen(true)}
    >
      <ClockIcon />
    </PickerIconButton>
  ) : undefined;

  return (
    <div data-slot="timepicker" dir={dir} className={cn("relative w-full max-w-xs", className)}>
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
      {name ? <input type="hidden" name={name} value={value && time ? value : ""} disabled={disabled} /> : null}
      <PickerModal
        open={open}
        onOpenChange={setOpen}
        title={text.title}
        dir={dir}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
        className={cn("max-w-[328px] min-[601px]:max-w-[600px]", contentClassName)}
      >
        <ClockPanel
          locale={locale}
          twelveHour={twelveHour}
          rules={rules}
          draft={draft}
          onDraftChange={setDraft}
          view={view}
          onViewChange={setView}
          vibrate={vibrate}
          labels={text}
          headerColor={headerColor}
          onMinutesPicked={(next) => {
            if (autoClose) {
              commit(next);
              setOpenState(false);
            }
          }}
          footer={
            <PickerFooter className="px-4">
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
          }
        />
      </PickerModal>
    </div>
  );
}

interface ClockPanelProps {
  locale: string;
  twelveHour: boolean;
  rules: TimeRules;
  draft: TimeValue;
  onDraftChange: (time: TimeValue) => void;
  view: ClockView;
  onViewChange: (view: ClockView) => void;
  vibrate: boolean;
  labels: Required<TimepickerI18n>;
  headerColor: "secondary" | "primary";
  onMinutesPicked: (time: TimeValue) => void;
  footer: React.ReactNode;
}

/** Header (big time, AM/PM) + analog dial. Lives inside the modal so it mounts on open. */
function ClockPanel({
  locale,
  twelveHour,
  rules,
  draft,
  onDraftChange,
  view,
  onViewChange,
  vibrate,
  labels,
  headerColor,
  onMinutesPicked,
  footer,
}: ClockPanelProps): React.JSX.Element {
  const hoursRef = React.useRef<HTMLDivElement>(null);
  const plateRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);
  const switchTimer = React.useRef<number | undefined>(undefined);
  const typed = React.useRef<{ buffer: string; at: number }>({ buffer: "", at: 0 });
  const pendingFocus = React.useRef(false);

  const number2 = React.useMemo(() => new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false }), [locale]);
  const number1 = React.useMemo(() => new Intl.NumberFormat(locale, { useGrouping: false }), [locale]);
  const [amLabel, pmLabel] = React.useMemo(() => getDayPeriodNames(locale), [locale]);
  const isPm = draft.hours >= 12;

  React.useEffect(() => {
    // Initial focus: the hour spinbutton (Radix would pick the first button otherwise).
    hoursRef.current?.focus();
    return () => window.clearTimeout(switchTimer.current);
  }, []);

  // After a keyboard/pointer view switch, keep focus on the visible dial.
  React.useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    plateRef.current
      ?.querySelector<HTMLElement>(`[data-dial="${view}"] [role="option"][tabindex="0"]`)
      ?.focus();
  });

  const buzz = (): void => {
    if (vibrate && typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(10);
  };

  /** Set the hour, keeping the minutes valid. */
  const setHours = (hours: number): void => {
    if (!isHourAllowed(hours, rules)) return;
    let { minutes } = draft;
    if (!isMinuteAllowed(hours, minutes, rules)) minutes = snapTime({ hours, minutes }, rules)?.minutes ?? minutes;
    const snapped = isMinuteAllowed(hours, minutes, rules) ? minutes : draft.minutes;
    if (hours === draft.hours && snapped === draft.minutes) return;
    onDraftChange({ hours, minutes: snapped });
  };
  const setMinutes = (minutes: number): void => {
    if (!isMinuteAllowed(draft.hours, minutes, rules) || minutes === draft.minutes) return;
    onDraftChange({ hours: draft.hours, minutes });
  };

  const stepHours = (delta: number): void => {
    for (let index = 1; index <= 24; index += 1) {
      const candidate = (((draft.hours + delta * index) % 24) + 24) % 24;
      if (isHourAllowed(candidate, rules)) {
        setHours(candidate);
        return;
      }
    }
  };
  const stepMinutes = (delta: number): void => {
    for (let index = 1; index <= 60; index += 1) {
      const candidate = (((draft.minutes + delta * index) % 60) + 60) % 60;
      if (isMinuteAllowed(draft.hours, candidate, rules)) {
        setMinutes(candidate);
        return;
      }
    }
  };

  const showView = (next: ClockView, moveFocus: boolean): void => {
    window.clearTimeout(switchTimer.current);
    if (moveFocus) pendingFocus.current = true;
    onViewChange(next);
  };

  const setPeriod = (pm: boolean): void => {
    if (pm === isPm) return;
    const hours = (draft.hours % 12) + (pm ? 12 : 0);
    setHours(hours);
  };

  /* -------------------------------------- keyboard -------------------------------------- */

  const typeDigit = (unit: ClockView, digit: string): void => {
    const now = Date.now();
    const state = typed.current;
    const buffer = now - state.at < 1000 && state.buffer.length < 2 ? state.buffer + digit : digit;
    typed.current = { buffer, at: now };
    const number = Number(buffer);
    if (unit === "hours") {
      let hours: number;
      if (twelveHour) {
        if (number < 1 || number > 12) return;
        hours = (number % 12) + (isPm ? 12 : 0);
      } else {
        if (number > 23) return;
        hours = number;
      }
      setHours(hours);
      const complete = buffer.length === 2 || number * 10 > (twelveHour ? 12 : 23);
      if (complete) typed.current = { buffer: "", at: 0 };
    } else {
      if (number > 59) return;
      if (isMinuteAllowed(draft.hours, number, rules)) setMinutes(number);
      if (buffer.length === 2 || number * 10 > 59) typed.current = { buffer: "", at: 0 };
    }
  };

  const onUnitKeyDown = (unit: ClockView, event: React.KeyboardEvent<HTMLElement>, fromDial: boolean): void => {
    const change = unit === "hours" ? stepHours : stepMinutes;
    const page = unit === "hours" ? 3 : 5;
    switch (event.key) {
      case "ArrowUp":
        change(1);
        break;
      case "ArrowDown":
        change(-1);
        break;
      case "ArrowRight":
        if (!fromDial) return;
        change(1);
        break;
      case "ArrowLeft":
        if (!fromDial) return;
        change(-1);
        break;
      case "PageUp":
        change(page);
        break;
      case "PageDown":
        change(-page);
        break;
      case "Home":
      case "End": {
        const forward = event.key === "Home";
        const limit = unit === "hours" ? 24 : 60;
        for (let offset = 0; offset < limit; offset += 1) {
          const candidate = forward ? offset : limit - 1 - offset;
          if (unit === "hours" ? isHourAllowed(candidate, rules) : isMinuteAllowed(draft.hours, candidate, rules)) {
            if (unit === "hours") setHours(candidate);
            else setMinutes(candidate);
            break;
          }
        }
        break;
      }
      case "Enter":
      case " ":
        if (!fromDial) return;
        event.preventDefault();
        if (unit === "hours") showView("minutes", true);
        else onMinutesPicked(draft);
        return;
      default:
        if (/^\d$/.test(event.key) && !fromDial) {
          event.preventDefault();
          typeDigit(unit, event.key);
        }
        return;
    }
    event.preventDefault();
    if (fromDial) pendingFocus.current = true;
  };

  /* --------------------------------------- pointer --------------------------------------- */

  const pickFromPoint = (clientX: number, clientY: number): TimeValue | null => {
    const plate = plateRef.current;
    if (!plate) return null;
    const rect = plate.getBoundingClientRect();
    const scale = rect.width / (DIAL_RADIUS * 2);
    const dx = (clientX - rect.left) / scale - DIAL_RADIUS;
    const dy = (clientY - rect.top) / scale - DIAL_RADIUS;
    let radian = Math.atan2(dx, -dy);
    if (radian < 0) radian += Math.PI * 2;
    const distance = Math.hypot(dx, dy);

    if (view === "hours") {
      const index = Math.round(radian / (Math.PI / 6)) % 12;
      let hours: number;
      if (twelveHour) hours = index + (isPm ? 12 : 0);
      else {
        const inner = distance < (INNER_RADIUS + OUTER_RADIUS) / 2;
        hours = inner ? (index === 0 ? 12 : index) : index === 0 ? 0 : index + 12;
      }
      if (!isHourAllowed(hours, rules)) return null;
      if (hours !== draft.hours) buzz();
      setHours(hours);
      return { hours, minutes: draft.minutes };
    }
    const minutes = (Math.round(radian / ((Math.PI * 2) / 60) / rules.step) * rules.step) % 60;
    if (!isMinuteAllowed(draft.hours, minutes, rules)) return null;
    if (minutes !== draft.minutes) buzz();
    setMinutes(minutes);
    return { hours: draft.hours, minutes };
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    pickFromPoint(event.clientX, event.clientY);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (dragging.current) pickFromPoint(event.clientX, event.clientY);
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!dragging.current) return;
    dragging.current = false;
    const picked = pickFromPoint(event.clientX, event.clientY);
    const focusInDial = plateRef.current?.contains(document.activeElement) ?? false;
    if (view === "hours") {
      switchTimer.current = window.setTimeout(() => showView("minutes", focusInDial), SWITCH_DELAY);
    } else {
      onMinutesPicked(picked ?? draft);
    }
  };

  /* --------------------------------------- render --------------------------------------- */

  const hourTicks: DialTick[] = React.useMemo(() => {
    if (twelveHour) {
      return Array.from({ length: 12 }, (_, index) => {
        const display = index === 0 ? 12 : index;
        return { value: index, label: number1.format(display), radius: OUTER_RADIUS, angle: (index / 6) * Math.PI, showLabel: true };
      });
    }
    return Array.from({ length: 24 }, (_, hours) => {
      const inner = hours > 0 && hours < 13;
      return {
        value: hours,
        label: hours === 0 ? number2.format(0) : number1.format(hours),
        radius: inner ? INNER_RADIUS : OUTER_RADIUS,
        angle: ((hours % 12) / 6) * Math.PI,
        showLabel: true,
      };
    });
  }, [twelveHour, number1, number2]);

  const minuteTicks: DialTick[] = React.useMemo(
    () =>
      Array.from({ length: Math.ceil(60 / rules.step) }, (_, index) => {
        const minutes = index * rules.step;
        return {
          value: minutes,
          label: number2.format(minutes),
          radius: OUTER_RADIUS,
          angle: (minutes / 30) * Math.PI,
          showLabel: minutes % 5 === 0,
        };
      }),
    [rules.step, number2],
  );

  const selectedHourTick = twelveHour ? draft.hours % 12 : draft.hours;
  const handTick =
    view === "hours"
      ? hourTicks.find((tick) => tick.value === selectedHourTick)
      : { value: draft.minutes, label: "", radius: OUTER_RADIUS, angle: (draft.minutes / 30) * Math.PI, showLabel: draft.minutes % 5 === 0 };
  const handAngle = handTick?.angle ?? 0;
  const handRadius = handTick?.radius ?? OUTER_RADIUS;
  const handX = Math.sin(handAngle) * (handRadius - TICK_RADIUS);
  const handY = -Math.cos(handAngle) * (handRadius - TICK_RADIUS);
  const bgX = Math.sin(handAngle) * handRadius;
  const bgY = -Math.cos(handAngle) * handRadius;

  const hourDisplay = twelveHour ? number1.format(draft.hours % 12 || 12) : number2.format(draft.hours);
  const hourText = twelveHour ? `${draft.hours % 12 || 12} ${isPm ? pmLabel : amLabel}` : String(draft.hours);

  const spinClass = (active: boolean): string =>
    cn(
      "cursor-pointer rounded-ui px-0.5 outline-none transition-colors focus-visible:focus-ring focus-visible:[outline-color:currentColor]",
      // 80% keeps the large header digits above 3:1 contrast.
      active ? "text-current" : "opacity-80 hover:opacity-100",
    );

  const renderDial = (unit: ClockView, ticks: DialTick[]): React.JSX.Element => {
    const active = view === unit;
    const selectedValue = unit === "hours" ? selectedHourTick : draft.minutes;
    // Roving tabindex: the selected tick, or the nearest labelled one.
    const focusValue = ticks.some((tick) => tick.value === selectedValue) ? selectedValue : ticks[0]?.value;
    return (
      <div
        data-dial={unit}
        role="listbox"
        aria-label={unit === "hours" ? labels.hours : labels.minutes}
        aria-orientation="horizontal"
        inert={!active}
        onKeyDown={(event) => onUnitKeyDown(unit, event, true)}
        className={cn(
          "absolute inset-0 duration-[350ms] motion-reduce:transition-none",
          // Visibility flips on at once (so the dial can take focus right away) and off after the fade.
          active
            ? "visible scale-100 opacity-100 transition-[opacity,transform]"
            : cn("invisible opacity-0 transition-[opacity,transform,visibility]", unit === "hours" ? "scale-110" : "scale-80"),
        )}
      >
        {ticks.map((tick) => {
          const selected = tick.value === selectedValue;
          const allowed =
            unit === "hours"
              ? isHourAllowed(twelveHour ? tick.value + (isPm ? 12 : 0) : tick.value, rules)
              : isMinuteAllowed(draft.hours, tick.value, rules);
          const left = DIAL_RADIUS + Math.sin(tick.angle) * tick.radius - TICK_RADIUS;
          const top = DIAL_RADIUS - Math.cos(tick.angle) * tick.radius - TICK_RADIUS;
          const spoken = unit === "hours" && twelveHour ? `${tick.label} ${isPm ? pmLabel : amLabel}` : tick.label;
          return (
            <div
              key={tick.value}
              role="option"
              aria-selected={selected}
              aria-disabled={!allowed || undefined}
              aria-label={spoken}
              tabIndex={tick.value === focusValue ? 0 : -1}
              data-value={tick.value}
              onFocus={() => {
                if (!selected && allowed && !dragging.current) {
                  if (unit === "hours") setHours(twelveHour ? tick.value + (isPm ? 12 : 0) : tick.value);
                  else setMinutes(tick.value);
                }
              }}
              className={cn(
                "pointer-events-none absolute flex size-10 items-center justify-center rounded-full text-[15px] outline-none",
                "focus-visible:focus-ring",
                selected ? "text-secondary-foreground" : allowed ? "text-foreground" : "text-disabled-foreground",
                !tick.showLabel && "text-transparent",
              )}
              style={{ left, top }}
            >
              {tick.showLabel ? <span aria-hidden="true">{tick.label}</span> : null}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div data-slot="timepicker-container" className="flex flex-col min-[601px]:flex-row">
      <div
        data-slot="timepicker-header"
        className={cn(
          "relative flex shrink-0 flex-col items-center justify-center p-2.5 min-[601px]:w-[230px]",
          headerColor === "primary" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
        )}
      >
        <div dir="ltr" className="flex items-baseline text-[4rem] leading-[1.2] font-normal select-none">
          <div
            ref={hoursRef}
            role="spinbutton"
            tabIndex={0}
            aria-label={labels.hours}
            aria-valuenow={twelveHour ? draft.hours % 12 || 12 : draft.hours}
            aria-valuemin={twelveHour ? 1 : 0}
            aria-valuemax={twelveHour ? 12 : 23}
            aria-valuetext={hourText}
            data-slot="timepicker-hours"
            data-active={view === "hours" || undefined}
            className={spinClass(view === "hours")}
            onClick={() => showView("hours", false)}
            onFocus={() => view !== "hours" && showView("hours", false)}
            onKeyDown={(event) => onUnitKeyDown("hours", event, false)}
          >
            {hourDisplay}
          </div>
          <span aria-hidden="true" className="opacity-60">
            :
          </span>
          <div
            role="spinbutton"
            tabIndex={0}
            aria-label={labels.minutes}
            aria-valuenow={draft.minutes}
            aria-valuemin={0}
            aria-valuemax={59}
            aria-valuetext={String(draft.minutes).padStart(2, "0")}
            data-slot="timepicker-minutes"
            data-active={view === "minutes" || undefined}
            className={spinClass(view === "minutes")}
            onClick={() => showView("minutes", false)}
            onFocus={() => view !== "minutes" && showView("minutes", false)}
            onKeyDown={(event) => onUnitKeyDown("minutes", event, false)}
          >
            {number2.format(draft.minutes)}
          </div>
        </div>
        {twelveHour ? (
          <div
            data-slot="timepicker-period"
            className="flex gap-3 text-[1.3rem] max-[600px]:absolute max-[600px]:end-4 max-[600px]:bottom-3 max-[600px]:flex-col max-[600px]:gap-0 min-[601px]:mt-5 min-[601px]:flex-col min-[601px]:gap-1"
          >
            {[
              { pm: false, label: amLabel },
              { pm: true, label: pmLabel },
            ].map((period) => {
              const active = period.pm === isPm;
              const allowed = Array.from({ length: 12 }, (_, h) => h + (period.pm ? 12 : 0)).some((h) =>
                isHourAllowed(h, rules),
              );
              return (
                <button
                  key={String(period.pm)}
                  type="button"
                  aria-pressed={active}
                  disabled={!allowed}
                  onClick={() => setPeriod(period.pm)}
                  className={cn(
                    "cursor-pointer rounded-ui px-1 leading-tight font-bold outline-none transition-opacity focus-visible:focus-ring focus-visible:[outline-color:currentColor]",
                    active ? "opacity-100" : "opacity-80 hover:opacity-100",
                    "disabled:cursor-default disabled:opacity-30",
                  )}
                >
                  {period.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col items-center">
        <div
          ref={plateRef}
          dir="ltr"
          data-slot="timepicker-plate"
          className="relative mt-[25px] mb-[5px] size-[270px] shrink-0 touch-none rounded-full bg-black/[0.07] select-none dark:bg-white/[0.08]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragging.current = false;
          }}
        >
          <svg
            aria-hidden="true"
            width={DIAL_RADIUS * 2}
            height={DIAL_RADIUS * 2}
            className="pointer-events-none absolute inset-0 overflow-visible"
          >
            <g transform={`translate(${DIAL_RADIUS} ${DIAL_RADIUS})`} className="fill-secondary stroke-secondary">
              <line x1={0} y1={0} x2={handX} y2={handY} strokeWidth={2} strokeLinecap="round" />
              <circle cx={bgX} cy={bgY} r={TICK_RADIUS} stroke="none" data-slot="timepicker-hand-tip" />
              {handTick && !handTick.showLabel ? (
                <circle cx={bgX} cy={bgY} r={3} stroke="none" className="fill-secondary-foreground" />
              ) : null}
              <circle cx={0} cy={0} r={3} stroke="none" />
            </g>
          </svg>
          {renderDial("hours", hourTicks)}
          {renderDial("minutes", minuteTicks)}
        </div>
        {footer}
      </div>
    </div>
  );
}
