import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { Timepicker24Hour } from "~/registry/examples/timepicker-24-hour";
import { TimepickerControlled } from "~/registry/examples/timepicker-controlled";
import { TimepickerDemo } from "~/registry/examples/timepicker-demo";
import { TimepickerForm } from "~/registry/examples/timepicker-form";
import { TimepickerLocales } from "~/registry/examples/timepicker-locales";
import { TimepickerStep } from "~/registry/examples/timepicker-step";

export const metadata: Metadata = { title: "Timepicker" };

export default function TimepickerPage(): React.JSX.Element {
  return (
    <ComponentDoc name="timepicker">
      <ComponentPreview name="timepicker-demo">
        <TimepickerDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="timepicker" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Timepicker } from "@/components/ui/timepicker";`} />
        <CodeBlock
          className="mt-3"
          code={`const [time, setTime] = React.useState<string | null>("10:30");\n\n<Timepicker label="Alarm" value={time} onValueChange={setTime} />`}
        />
        <p>
          The value is always a 24-hour <code>&quot;HH:mm&quot;</code> string, whatever clock is shown. Pick the hour on
          the dial (click or drag), and the picker switches to minutes. You can also type a time such as{" "}
          <code>10:30 pm</code> or <code>22:30</code> into the field.
        </p>
      </DocSection>

      <DocSection title="24-hour clock">
        <p>
          <code>twelveHour</code> defaults to the locale&apos;s hour cycle. The 24-hour dial has an inner ring for 1–12
          and an outer ring for 13–00.
        </p>
        <ComponentPreview name="timepicker-24-hour">
          <Timepicker24Hour />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Step, min and max">
        <p>
          <code>step</code> snaps the minutes; <code>minTime</code> and <code>maxTime</code> disable hours and minutes
          outside the range on the dial, the spinbuttons and typed input.
        </p>
        <ComponentPreview name="timepicker-step">
          <TimepickerStep />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Locales">
        <p>
          Digits, AM/PM labels (from <code>Intl.DateTimeFormat</code> day periods) and the default clock follow{" "}
          <code>locale</code>. Translate the buttons with <code>i18n</code>.
        </p>
        <ComponentPreview name="timepicker-locales">
          <TimepickerLocales />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled">
        <ComponentPreview name="timepicker-controlled">
          <TimepickerControlled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="In a form">
        <p>
          With a <code>name</code>, a hidden input submits <code>HH:mm</code>. <code>autoClose</code> commits as soon as
          the minutes are picked on the dial.
        </p>
        <ComponentPreview name="timepicker-form">
          <TimepickerForm />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "value", type: "string | null", description: 'Selected time as "HH:mm" (controlled).' },
            { name: "defaultValue", type: "string | null", description: "Initial time (uncontrolled)." },
            { name: "onValueChange", type: "(value: string | null) => void", description: "Called when a time is committed." },
            { name: "open / defaultOpen", type: "boolean", description: "Open state (controlled / initial)." },
            { name: "onOpenChange", type: "(open: boolean) => void", description: "Called on every open and close." },
            { name: "label", type: "ReactNode", description: "Floating label." },
            { name: "helperText", type: "ReactNode", description: "Text under the field." },
            { name: "twelveHour", type: "boolean", default: "from locale", description: "12-hour clock with AM/PM." },
            { name: "locale", type: "string", default: "navigator.language", description: "BCP 47 locale." },
            { name: "step", type: "number", default: "1", description: "Minute granularity." },
            { name: "minTime / maxTime", type: "string", description: 'Selectable bounds, "HH:mm".' },
            { name: "autoClose", type: "boolean", default: "false", description: "Commit and close after picking minutes." },
            { name: "showClearBtn", type: "boolean", default: "false", description: "Show the Clear button." },
            { name: "defaultTime", type: "string", default: '"now"', description: 'Time shown when opening empty: "now" or "HH:mm".' },
            { name: "vibrate", type: "boolean", default: "false", description: "Vibrate on dial changes (where supported)." },
            {
              name: "i18n",
              type: "TimepickerI18n",
              description: "cancel, clear, done, openPicker, title, hours, minutes.",
            },
            { name: "name", type: "string", description: "Hidden input name; submits HH:mm." },
            { name: "openOnClick", type: "boolean", default: "true", description: "Open when the field is clicked." },
            { name: "showIcon", type: "boolean", default: "true", description: "Show the clock icon button." },
            { name: "headerColor", type: '"secondary" | "primary"', default: '"secondary"', description: "Header color." },
            { name: "readOnly / disabled", type: "boolean", description: "Prevent typing and opening." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <p>
          Materialize&apos;s timepicker had no keyboard or screen reader support. Here the hours and minutes in the
          header are spinbuttons and the dial is a listbox.
        </p>
        <PropsTable
          props={[
            { name: "↑ / ↓", type: "spinbutton", description: "Next / previous hour, or minute step." },
            { name: "PageUp / PageDown", type: "spinbutton", description: "±5 minutes (±3 hours)." },
            { name: "Home / End", type: "spinbutton", description: "First / last allowed value." },
            { name: "0–9", type: "spinbutton", description: "Type the hour or minutes." },
            { name: "Arrow keys", type: "dial", description: "Move the hand clockwise / counter-clockwise." },
            { name: "Enter / Space", type: "dial", description: "Confirm the hour and go to minutes." },
            { name: "Esc", type: "dialog", description: "Close without changing the value." },
          ]}
        />
        <ul>
          <li>The modal is a Radix Dialog: focus starts on the hour, is trapped, and returns to the field on close.</li>
          <li>AM/PM are toggle buttons with <code>aria-pressed</code> and localized names.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
