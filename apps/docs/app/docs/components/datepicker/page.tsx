import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { DatepickerControlled } from "~/registry/examples/datepicker-controlled";
import { DatepickerCustomFormat } from "~/registry/examples/datepicker-custom-format";
import { DatepickerDemo } from "~/registry/examples/datepicker-demo";
import { DatepickerDisabledDays } from "~/registry/examples/datepicker-disabled-days";
import { DatepickerForm } from "~/registry/examples/datepicker-form";
import { DatepickerLocales } from "~/registry/examples/datepicker-locales";
import { DatepickerMinMax } from "~/registry/examples/datepicker-min-max";
import { DatepickerPopover } from "~/registry/examples/datepicker-popover";
import { DatepickerStates } from "~/registry/examples/datepicker-states";

export const metadata: Metadata = { title: "Datepicker" };

export default function DatepickerPage(): React.JSX.Element {
  return (
    <ComponentDoc name="datepicker">
      <ComponentPreview name="datepicker-demo">
        <DatepickerDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="datepicker" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Datepicker } from "@/components/ui/datepicker";`} />
        <CodeBlock className="mt-3" code={`<Datepicker label="Birthday" />`} />
        <p>
          Clicking the field (or the calendar icon, or pressing <kbd>Alt</kbd> + <kbd>↓</kbd>) opens Materialize&apos;s
          modal: the selected date in a colored header, the calendar, and Clear / Cancel / OK. The modal edits a draft
          that OK commits. You can also type a date into the field; it is parsed in the user&apos;s locale when the field
          loses focus or Enter is pressed.
        </p>
      </DocSection>

      <DocSection title="Popover">
        <p>
          <code>variant=&quot;popover&quot;</code> anchors just the calendar to the field. It flips and shifts to stay
          on screen, and picking a day commits and closes it.
        </p>
        <ComponentPreview name="datepicker-popover">
          <DatepickerPopover />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Min and max dates">
        <ComponentPreview name="datepicker-min-max">
          <DatepickerMinMax />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Disabled days">
        <p>
          Combine <code>disableWeekends</code> with a <code>disabledDays</code> predicate. Typed dates that are
          disabled are rejected too.
        </p>
        <ComponentPreview name="datepicker-disabled-days">
          <DatepickerDisabledDays />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Locales">
        <p>
          <code>locale</code> drives the field text, the header, the calendar names and digits, the first day of the week
          and right-to-left layout. Translate the buttons with <code>i18n</code>.
        </p>
        <ComponentPreview name="datepicker-locales">
          <DatepickerLocales />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Custom format">
        <p>
          Pass <code>Intl.DateTimeFormat</code> options as <code>format</code>, or your own <code>formatDate</code> and{" "}
          <code>parseDate</code> functions.
        </p>
        <ComponentPreview name="datepicker-custom-format">
          <DatepickerCustomFormat />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled">
        <p>
          Both the value and the open state can be controlled. <code>onOpenChange</code> fires on every close path:
          OK, Cancel, Clear, Esc and clicking the overlay.
        </p>
        <ComponentPreview name="datepicker-controlled">
          <DatepickerControlled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="In a form">
        <p>
          With a <code>name</code>, a hidden input submits the value as <code>yyyy-mm-dd</code>.{" "}
          <code>autoClose</code> commits as soon as a day is picked.
        </p>
        <ComponentPreview name="datepicker-form">
          <DatepickerForm />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Read only and disabled">
        <p>Unlike Materialize, read-only and disabled fields never open the picker.</p>
        <ComponentPreview name="datepicker-states">
          <DatepickerStates />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "value", type: "Date | null", description: "Selected day (controlled)." },
            { name: "defaultValue", type: "Date | null", description: "Initial day (uncontrolled)." },
            { name: "onValueChange", type: "(value: Date | null) => void", description: "Called when a day is committed." },
            { name: "open / defaultOpen", type: "boolean", description: "Open state (controlled / initial)." },
            { name: "onOpenChange", type: "(open: boolean) => void", description: "Called on every open and close." },
            { name: "variant", type: '"modal" | "popover"', default: '"modal"', description: "Materialize modal or anchored popover." },
            { name: "label", type: "ReactNode", description: "Floating label." },
            { name: "helperText", type: "ReactNode", description: "Text under the field." },
            {
              name: "format",
              type: "Intl.DateTimeFormatOptions",
              default: "medium date",
              description: "Field text format. Default: { year: \"numeric\", month: \"short\", day: \"numeric\" } (Nov 15, 2026).",
            },
            { name: "formatDate", type: "(date, locale) => string", description: "Custom field formatter." },
            { name: "parseDate", type: "(text, locale) => Date | null", description: "Custom parser for typed text." },
            { name: "autoClose", type: "boolean", default: "false", description: "Commit and close when a day is picked." },
            { name: "showClearBtn", type: "boolean", default: "false", description: "Show the Clear button." },
            {
              name: "i18n",
              type: "DatepickerI18n",
              description: "cancel, clear, done, openPicker, title and calendar labels.",
            },
            { name: "minDate / maxDate", type: "Date | null", description: "Selectable bounds." },
            { name: "disabledDays", type: "(date: Date) => boolean", description: "Disable any day." },
            { name: "disableWeekends", type: "boolean", default: "false", description: "Disable Saturdays and Sundays." },
            { name: "firstDayOfWeek", type: "0–6", default: "from locale", description: "First calendar column." },
            { name: "locale", type: "string", default: "navigator.language", description: "BCP 47 locale." },
            { name: "yearRange", type: "number | [number, number]", default: "100", description: "Years in the year view." },
            { name: "showOutsideDays", type: "boolean", default: "false", description: "Show days of adjacent months." },
            { name: "events", type: "Date[]", description: "Days marked with a dot." },
            { name: "name", type: "string", description: "Hidden input name; submits yyyy-mm-dd." },
            { name: "openOnClick", type: "boolean", default: "true", description: "Open when the field is clicked." },
            { name: "showIcon", type: "boolean", default: "true", description: "Show the calendar icon button." },
            { name: "headerColor", type: '"secondary" | "primary"', default: '"secondary"', description: "Modal header color." },
            { name: "readOnly / disabled", type: "boolean", description: "Prevent typing and opening." },
          ]}
        />
        <p>
          Other <code>&lt;input&gt;</code> props (<code>id</code>, <code>placeholder</code>, <code>required</code>,{" "}
          <code>aria-*</code>, <code>ref</code>…) go to the text field. <code>className</code> styles the wrapper;{" "}
          <code>inputClassName</code> and <code>contentClassName</code> style the input and the modal/popover.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            The modal is a Radix Dialog: focus moves to the selected day, is trapped inside, and returns to the field on
            close. Esc and clicking the overlay close it.
          </li>
          <li>
            The calendar grid supports the full WAI-ARIA keyboard model (arrows, PageUp/PageDown, Shift+PageUp/PageDown,
            Home/End, Enter). See the Calendar page.
          </li>
          <li>
            The field is a normal text input: keyboard users can type a date, or open the picker with{" "}
            <kbd>Alt</kbd> + <kbd>↓</kbd> or the labelled icon button.
          </li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
