import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { ChipsInputControlled } from "~/registry/examples/chips-input-controlled";
import { ChipsInputDemo } from "~/registry/examples/chips-input-demo";
import { ChipsInputForm } from "~/registry/examples/chips-input-form";
import { ChipsInputSuggestions } from "~/registry/examples/chips-input-suggestions";

export const metadata: Metadata = { title: "Chips Input" };

export default function ChipsInputPage(): React.JSX.Element {
  return (
    <ComponentDoc name="chips-input">
      <ComponentPreview name="chips-input-demo">
        <ChipsInputDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="chips-input" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { ChipsInput } from "@/components/ui/chips-input";`} />
        <CodeBlock className="mt-3" code={`<ChipsInput label="Tags" name="tags" defaultValue={["React"]} />`} />
      </DocSection>

      <DocSection title="Suggestions">
        <p>
          <code>suggestions</code> (or async <code>loadSuggestions</code>) shows the same accessible list as{" "}
          <code>Autocomplete</code>. Chips already added are hidden from it, and{" "}
          <code>limit</code> caps the number of chips.
        </p>
        <ComponentPreview name="chips-input-suggestions">
          <ChipsInputSuggestions />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Controlled">
        <p>
          Chips are strings or <code>&#123; tag, image &#125;</code> objects. <code>onAdd</code> and{" "}
          <code>onDelete</code> fire for user changes; setting <code>value</code> from outside updates the chips.
        </p>
        <ComponentPreview name="chips-input-controlled">
          <ChipsInputControlled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Forms">
        <p>
          With <code>name</code>, every chip is submitted as a value of that field (<code>formData.getAll(name)</code>).{" "}
          <code>required</code> blocks submission until there is at least one chip.
        </p>
        <ComponentPreview name="chips-input-form">
          <ChipsInputForm />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="ChipsInput"
          props={[
            { name: "value", type: "ChipsInputChip[]", description: "Chips (controlled). Strings or { tag, image, imageAlt }." },
            { name: "defaultValue", type: "ChipsInputChip[]", default: "[]", description: "Initial chips." },
            { name: "onValueChange", type: "function", description: "Called with the new list." },
            { name: "onAdd / onDelete", type: "function", description: "Called after a chip is added or removed." },
            { name: "limit", type: "number", default: "Infinity", description: "Maximum number of chips." },
            { name: "allowDuplicates", type: "boolean", default: "false", description: "Allow the same text twice." },
            { name: "placeholder", type: "string", description: "Placeholder while empty." },
            { name: "secondaryPlaceholder", type: "string", description: "Placeholder once chips exist." },
            { name: "suggestions", type: "Array<string | Option>", description: "Static suggestions." },
            { name: "loadSuggestions", type: "AutocompleteLoader", description: "Async suggestions." },
            { name: "suggestionLimit", type: "number", description: "Maximum suggestions shown." },
            { name: "name", type: "string", description: "Submit each chip under this field name." },
          ]}
        />
        <p>
          Also accepts <code>label</code>, <code>helperText</code>, <code>error</code>, <code>prefix</code>,{" "}
          <code>variant</code>, <code>required</code>, <code>disabled</code> and other input props (forwarded to the
          text input).
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <PropsTable
          title="Keyboard"
          props={[
            { name: "Enter / ,", type: "input", description: "Add the typed text as a chip." },
            { name: "Backspace / Left", type: "input", description: "With an empty input (or caret at start), focus the last chip." },
            { name: "Left / Right", type: "chip", description: "Move between chips; Right on the last chip returns to the input." },
            { name: "Home / End", type: "chip", description: "First or last chip." },
            { name: "Delete / Backspace", type: "chip", description: "Remove the focused chip." },
            { name: "ArrowDown / Up, Enter", type: "input", description: "Pick a suggestion when the list is open." },
          ]}
        />
        <ul>
          <li>Chips form a list with a single tab stop (roving tabindex); the remove buttons are labelled.</li>
          <li>Additions and removals are announced in a polite live region.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
