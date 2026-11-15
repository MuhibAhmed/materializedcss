import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { AutocompleteAsync } from "~/registry/examples/autocomplete-async";
import { AutocompleteControlled } from "~/registry/examples/autocomplete-controlled";
import { AutocompleteDemo } from "~/registry/examples/autocomplete-demo";
import { AutocompleteForm } from "~/registry/examples/autocomplete-form";
import { AutocompleteImages } from "~/registry/examples/autocomplete-images";
import { AutocompleteOverflow } from "~/registry/examples/autocomplete-overflow";

export const metadata: Metadata = { title: "Autocomplete" };

export default function AutocompletePage(): React.JSX.Element {
  return (
    <ComponentDoc name="autocomplete">
      <ComponentPreview name="autocomplete-demo">
        <AutocompleteDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="autocomplete" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Autocomplete } from "@/components/ui/autocomplete";`} />
        <CodeBlock
          className="mt-3"
          code={`<Autocomplete
  label="Fruit"
  data={{ Apple: null, Banana: null, Google: "https://example.com/google.png" }}
  onAutocomplete={(option) => console.log(option.value)}
/>`}
        />
      </DocSection>

      <DocSection title="Images">
        <p>
          Each option can carry an <code>image</code> URL (the values of Materialize&apos;s <code>data</code> map). URLs are
          set as React props and scheme-checked, so a crafted value cannot inject markup.
        </p>
        <ComponentPreview name="autocomplete-images">
          <AutocompleteImages />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Async options">
        <p>
          <code>loadOptions(query, signal)</code> runs after <code>debounceMs</code>. The <code>AbortSignal</code> fires
          when a newer query starts, so stale responses never overwrite fresh ones.
        </p>
        <ComponentPreview name="autocomplete-async">
          <AutocompleteAsync />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Limit, minLength and controlled value">
        <ComponentPreview name="autocomplete-controlled">
          <AutocompleteControlled />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Inside overflow containers">
        <p>The list renders in a portal and flips or shrinks to fit the viewport, so it is never clipped.</p>
        <ComponentPreview name="autocomplete-overflow">
          <AutocompleteOverflow />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Forms">
        <ComponentPreview name="autocomplete-form">
          <AutocompleteForm />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Autocomplete"
          props={[
            { name: "options", type: "AutocompleteOption[]", description: "Suggestions: value, label, image, imageAlt, disabled." },
            { name: "data", type: "AutocompleteData", description: "Materialize-style map of label to image URL or null." },
            { name: "loadOptions", type: "AutocompleteLoader", description: "(query, signal) => Promise of options. Async suggestions." },
            { name: "debounceMs", type: "number", default: "250", description: "Delay before loadOptions runs." },
            { name: "limit", type: "number", default: "Infinity", description: "Maximum suggestions shown." },
            { name: "minLength", type: "number", default: "1", description: "Characters needed before the list opens." },
            { name: "filter", type: "function", description: "Custom matcher for static options." },
            { name: "onAutocomplete", type: "function", description: "Called when a suggestion is chosen." },
            { name: "value", type: "string", description: "Input text (controlled). Use defaultValue for uncontrolled and onValueChange to listen." },
            { name: "emptyMessage", type: "ReactNode | null", default: '"No results"', description: "Shown when nothing matches; null hides the list." },
            { name: "loadingMessage", type: "ReactNode", default: '"Loading…"', description: "Shown while loading." },
            { name: "renderOption", type: "function", description: "Custom option content." },
          ]}
        />
        <p>
          All <code>TextField</code> props (<code>label</code>, <code>helperText</code>, <code>error</code>,{" "}
          <code>prefix</code>, <code>variant</code>, <code>name</code>...) are supported. For custom inputs, use the{" "}
          <code>useAutocomplete</code> hook with <code>AutocompleteListbox</code>; <code>ChipsInput</code> is built that way.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <p>Follows the WAI-ARIA combobox pattern with a listbox popup.</p>
        <PropsTable
          title="Keyboard"
          props={[
            { name: "ArrowDown/Up", type: "", description: "Open the list, then move the highlight (wraps, skips disabled)." },
            { name: "Home / End", type: "", description: "First or last suggestion while the list is open." },
            { name: "Enter", type: "", description: "Choose the highlighted suggestion." },
            { name: "Escape", type: "", description: "Close the list and keep the typed text." },
            { name: "Tab", type: "", description: "Close the list and move focus." },
          ]}
        />
        <ul>
          <li>The input keeps focus; the highlighted option is exposed with <code>aria-activedescendant</code>.</li>
          <li>The number of results is announced in a polite live region.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
