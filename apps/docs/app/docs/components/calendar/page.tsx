import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { CalendarDemo } from "~/registry/examples/calendar-demo";
import { CalendarDisabledDays } from "~/registry/examples/calendar-disabled-days";
import { CalendarEvents } from "~/registry/examples/calendar-events";
import { CalendarLocales } from "~/registry/examples/calendar-locales";
import { CalendarMinMax } from "~/registry/examples/calendar-min-max";
import { CalendarOutsideDays } from "~/registry/examples/calendar-outside-days";
import { CalendarRange } from "~/registry/examples/calendar-range";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage(): React.JSX.Element {
  return (
    <ComponentDoc name="calendar">
      <ComponentPreview name="calendar-demo">
        <CalendarDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="calendar" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Calendar } from "@/components/ui/calendar";`} />
        <CodeBlock
          className="mt-3"
          code={`const [date, setDate] = React.useState<Date | null>(null);\n\n<Calendar value={date} onValueChange={setDate} />`}
        />
        <p>
          The calendar is the grid inside the Datepicker. Use it on its own for
          inline date selection, booking widgets or dashboards. Click the month caption to jump to another year and
          month.
        </p>
      </DocSection>

      <DocSection title="Range">
        <p>
          With <code>mode=&quot;range&quot;</code> the first click sets <code>from</code> and the second sets{" "}
          <code>to</code>. While you pick the end, hovering previews the range.
        </p>
        <ComponentPreview name="calendar-range">
          <CalendarRange />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Min and max dates">
        <p>
          Days outside <code>minDate</code>/<code>maxDate</code> are disabled, the previous/next buttons stop at those
          months, and keyboard focus is clamped to the range.
        </p>
        <ComponentPreview name="calendar-min-max">
          <CalendarMinMax />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Disabled days">
        <p>
          <code>disableWeekends</code> disables Saturdays and Sundays, and <code>disabledDays</code> takes any
          predicate. Disabled days stay focusable for keyboard and screen reader users but cannot be selected.
        </p>
        <ComponentPreview name="calendar-disabled-days">
          <CalendarDisabledDays />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Events">
        <p>
          Days listed in <code>events</code> get a dot, like Materialize&apos;s datepicker events.
        </p>
        <ComponentPreview name="calendar-events">
          <CalendarEvents />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Outside days and first day of week">
        <p>
          <code>showOutsideDays</code> shows (and lets you pick) days of the adjacent months. The first column comes
          from the locale (<code>Intl.Locale</code> week info); override it with <code>firstDayOfWeek</code>.
        </p>
        <ComponentPreview name="calendar-outside-days">
          <CalendarOutsideDays />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Locales">
        <p>
          Month and weekday names, digits, the first day of the week and the writing direction all follow{" "}
          <code>locale</code> (default: the browser language). No date library is needed: everything uses{" "}
          <code>Intl</code>.
        </p>
        <ComponentPreview name="calendar-locales">
          <CalendarLocales />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Date utilities">
        <p>
          The helpers behind the pickers live in <code>lib/date.ts</code> (registry item <code>date-utils</code>):{" "}
          <code>addMonths</code>, <code>isSameDay</code>, <code>getCalendarMatrix</code>, <code>getWeekdayNames</code>,{" "}
          <code>getFirstDayOfWeek</code>, <code>parseLocaleDate</code>, <code>toISODateString</code> and more.
        </p>
        <CodeBlock
          code={`import { getCalendarMatrix, getFirstDayOfWeek, parseLocaleDate } from "@/lib/date";\n\ngetFirstDayOfWeek("de-DE"); // 1 (Monday)\nparseLocaleDate("15.11.2026", "de-DE"); // Date(2026, 10, 15)\ngetCalendarMatrix(new Date(), 1); // 6 weeks of 7 days`}
        />
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "mode", type: '"single" | "range"', default: '"single"', description: "Pick one day or a range." },
            {
              name: "value",
              type: "Date | null | DateRange",
              description: "Selected day (single) or { from, to } (range), controlled.",
            },
            { name: "defaultValue", type: "Date | null | DateRange", description: "Initial selection (uncontrolled)." },
            { name: "onValueChange", type: "(value) => void", description: "Called when a day is picked." },
            { name: "month / defaultMonth", type: "Date", description: "Visible month (controlled / initial)." },
            { name: "onMonthChange", type: "(month: Date) => void", description: "Called when the visible month changes." },
            { name: "minDate / maxDate", type: "Date | null", description: "Selectable bounds (inclusive)." },
            { name: "disabledDays", type: "(date: Date) => boolean", description: "Disable any day." },
            { name: "disableWeekends", type: "boolean", default: "false", description: "Disable Saturdays and Sundays." },
            { name: "firstDayOfWeek", type: "0–6", default: "from locale", description: "First column (0 = Sunday)." },
            {
              name: "locale",
              type: "string",
              default: "navigator.language",
              description: 'BCP 47 locale ("en-US" during server rendering).',
            },
            { name: "showOutsideDays", type: "boolean", default: "false", description: "Show days of adjacent months." },
            { name: "events", type: "Date[]", description: "Days marked with a dot." },
            {
              name: "yearRange",
              type: "number | [number, number]",
              default: "100",
              description: "Years in the year view: n either side of today, or [from, to].",
            },
            {
              name: "weekdayFormat",
              type: '"narrow" | "short" | "long"',
              default: '"narrow"',
              description: "Width of the weekday names.",
            },
            { name: "autoFocus", type: "boolean", default: "false", description: "Focus the active day on mount." },
            { name: "labels", type: "CalendarLabels", description: "Accessible names of the controls (i18n)." },
          ]}
        />
        <p>
          Other <code>&lt;div&gt;</code> props are forwarded to the root. Parts carry <code>data-slot</code> (
          <code>calendar-header</code>, <code>calendar-grid</code>, <code>calendar-day</code>…) and days expose{" "}
          <code>data-today</code>, <code>data-selected</code>, <code>data-outside</code>, <code>data-range-start</code>,{" "}
          <code>data-range-end</code> and <code>data-in-range</code> for styling.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <p>Follows the WAI-ARIA date picker grid pattern: one tab stop for the grid, with a roving focus.</p>
        <PropsTable
          props={[
            { name: "← / →", type: "key", description: "Previous / next day (mirrored in right-to-left locales)." },
            { name: "↑ / ↓", type: "key", description: "Same day of the previous / next week." },
            { name: "PageUp / PageDown", type: "key", description: "Same day of the previous / next month." },
            { name: "Shift + PageUp / PageDown", type: "key", description: "Same day of the previous / next year." },
            { name: "Home / End", type: "key", description: "First / last day of the week." },
            { name: "Enter / Space", type: "key", description: "Select the focused day." },
            { name: "Escape", type: "key", description: "Return from the year or month view to the days." },
          ]}
        />
        <ul>
          <li>
            The grid has <code>role=&quot;grid&quot;</code>; each day is a <code>gridcell</code> named with its full
            date, with <code>aria-selected</code>, <code>aria-disabled</code> and{" "}
            <code>aria-current=&quot;date&quot;</code> for today.
          </li>
          <li>Month changes are announced through a polite live region.</li>
          <li>The year and month views are listboxes with arrow-key navigation.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
