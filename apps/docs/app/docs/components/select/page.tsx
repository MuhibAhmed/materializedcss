import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { Callout, DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { SelectControlled } from "~/registry/examples/select-controlled";
import { SelectDemo } from "~/registry/examples/select-demo";
import { SelectForm } from "~/registry/examples/select-form";
import { SelectGroups } from "~/registry/examples/select-groups";
import { SelectIcons } from "~/registry/examples/select-icons";
import { SelectMultiple } from "~/registry/examples/select-multiple";
import { SelectNative } from "~/registry/examples/select-native";
import { SelectOverflow } from "~/registry/examples/select-overflow";

export const metadata: Metadata = { title: "Select" };

export default function SelectPage(): React.JSX.Element {
  return (
    <ComponentDoc name="select">
      <ComponentPreview name="select-demo">
        <SelectDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="select" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Select, SelectItem } from "@/components/ui/select";`} />
        <CodeBlock
          className="mt-3"
          code={`<Select label="Size" name="size" defaultValue="m">
  <SelectItem value="s">Small</SelectItem>
  <SelectItem value="m">Medium</SelectItem>
  <SelectItem value="l">Large</SelectItem>
</Select>`}
        />
      </DocSection>

      <DocSection title="Option groups">
        <p>
          Wrap options in <code>SelectGroup</code> with a <code>SelectLabel</code> (Materialize&apos;s{" "}
          <code>optgroup</code>). <code>SelectSeparator</code> draws a divider. A <code>placeholder</code> keeps the label
          floated.
        </p>
        <ComponentPreview name="select-groups">
          <SelectGroups />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Icons and images">
        <p>
          <code>SelectItem</code> takes an <code>icon</code> or an <code>image</code> URL (shown as a round avatar). The
          select also supports a <code>prefix</code> icon and the <code>outlined</code> variant.
        </p>
        <ComponentPreview name="select-icons">
          <SelectIcons />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Multiple">
        <p>
          <code>MultiSelect</code> lists options with filled-in checkboxes. The selection shows as comma-separated text
          (like Materialize) or as chips with <code>display=&quot;chips&quot;</code>. The list stays open while you pick.
        </p>
        <ComponentPreview name="select-multiple">
          <SelectMultiple />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Native select">
        <p>
          <code>NativeSelect</code> is a real <code>&lt;select&gt;</code> styled like the other fields. It opens the
          platform picker, which is usually the best experience on phones.
        </p>
        <ComponentPreview name="select-native">
          <SelectNative />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled">
        <p>
          Pass <code>value</code> and <code>onValueChange</code>. Changes made from state show up immediately; there is
          no need to re-initialise the plugin as with Materialize. Set the value to <code>&quot;&quot;</code> to clear it.
        </p>
        <ComponentPreview name="select-controlled">
          <SelectControlled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Inside overflow containers">
        <p>
          The dropdown renders in a portal and flips or shifts to stay in the viewport, so cards, modals and scroll
          areas with <code>overflow: hidden</code> never clip it.
        </p>
        <ComponentPreview name="select-overflow">
          <SelectOverflow />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Forms">
        <p>
          With a <code>name</code>, each select takes part in native form submission and <code>required</code>{" "}
          validation. <code>MultiSelect</code> submits every selected value under the same name.
        </p>
        <ComponentPreview name="select-form">
          <SelectForm />
        </ComponentPreview>
        <Callout title="Touch devices">
          Materialize&apos;s select picked the wrong item on iOS and could close as soon as it opened. Radix Select opens on
          tap release and selects on pointer up, so the tapped option is always the one chosen.
        </Callout>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Select"
          props={[
            { name: "value", type: "string", description: "Selected value (controlled). \"\" means none." },
            { name: "defaultValue", type: "string", description: "Initial value (uncontrolled)." },
            { name: "onValueChange", type: "(value: string) => void", description: "Called when an option is picked." },
            { name: "open", type: "boolean", description: "Open state (controlled); also defaultOpen and onOpenChange." },
            { name: "label", type: "ReactNode", description: "Floating label." },
            { name: "placeholder", type: "ReactNode", description: "Shown when nothing is selected." },
            { name: "helperText", type: "ReactNode", description: "Text under the field." },
            { name: "error", type: "ReactNode | boolean", description: "true or a message. Sets aria-invalid." },
            { name: "success", type: "boolean", default: "false", description: "Valid (green) state." },
            { name: "name", type: "string", description: "Form field name (a hidden native select is rendered in forms)." },
            { name: "required", type: "boolean", default: "false", description: "Require a value. form and autoComplete are supported too." },
            { name: "disabled", type: "boolean", default: "false", description: "Disable the select." },
            { name: "prefix", type: "ReactNode", description: "Leading icon." },
            { name: "variant", type: '"standard" | "outlined"', default: '"standard"', description: "Underline or outlined box." },
            { name: "triggerClassName", type: "string", description: "Class for the trigger. Also contentClassName and labelClassName; className goes on the wrapper." },
          ]}
        />
        <PropsTable
          title="SelectItem"
          props={[
            { name: "value", type: "string", description: "Option value (required, not empty)." },
            { name: "disabled", type: "boolean", default: "false", description: "Option cannot be picked." },
            { name: "icon", type: "ReactNode", description: "Leading icon." },
            { name: "image", type: "string", description: "Round image at the end of the option (alt text via imageAlt)." },
            { name: "textValue", type: "string", description: "Text for type-ahead when children are not plain text." },
          ]}
        />
        <PropsTable
          title="MultiSelect"
          props={[
            { name: "options", type: "MultiSelectOption[]", description: "{ value, label, disabled?, group?, icon? } items." },
            { name: "value", type: "string[]", description: "Selected values (controlled); defaultValue for uncontrolled." },
            { name: "onValueChange", type: "(value: string[]) => void", description: "Called when the selection changes." },
            { name: "display", type: '"text" | "chips"', default: '"text"', description: "Summary style in the trigger." },
            { name: "name", type: "string", description: "Each selected value is submitted under this name. required and form are supported." },
          ]}
        />
        <p>
          <code>MultiSelect</code> also accepts the field props of <code>Select</code> (label, helperText, error, prefix,
          variant...). <code>NativeSelect</code> accepts every <code>&lt;select&gt;</code> prop plus the same field props.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li><kbd>Space</kbd>, <kbd>Enter</kbd>, <kbd>↓</kbd> or <kbd>↑</kbd> on the trigger opens the list.</li>
          <li><kbd>↓</kbd> / <kbd>↑</kbd> move between options (disabled ones are skipped); <kbd>Home</kbd> / <kbd>End</kbd> jump to the first / last.</li>
          <li>Typing a letter jumps to the next option starting with it.</li>
          <li><kbd>Enter</kbd> / <kbd>Space</kbd> selects (Select) or toggles (MultiSelect); <kbd>Esc</kbd> closes and returns focus to the trigger.</li>
        </ul>
        <ul>
          <li>
            The trigger is a <code>combobox</code> named by its label; the list is a <code>listbox</code> of{" "}
            <code>option</code>s (<code>aria-multiselectable</code> for MultiSelect).
          </li>
          <li>Helper and error text are linked with <code>aria-describedby</code>; errors set <code>aria-invalid</code>.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
