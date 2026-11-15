import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { FileInputAccept } from "~/registry/examples/file-input-accept";
import { FileInputDemo } from "~/registry/examples/file-input-demo";
import { FileInputForm } from "~/registry/examples/file-input-form";
import { FileInputMultiple } from "~/registry/examples/file-input-multiple";

export const metadata: Metadata = { title: "File Input" };

export default function FileInputPage(): React.JSX.Element {
  return (
    <ComponentDoc name="file-input">
      <ComponentPreview name="file-input-demo">
        <FileInputDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="file-input" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { FileInput } from "@/components/ui/file-input";`} />
        <CodeBlock className="mt-3" code={`<FileInput label="Attachment" name="attachment" />`} />
      </DocSection>

      <DocSection title="Multiple files and drag and drop">
        <p>
          With <code>multiple</code>, the path field lists every file name. Files can also be dropped onto the field
          (turn this off with <code>dropzone=&#123;false&#125;</code>). <code>clearable</code> adds a clear button and{" "}
          <code>onFilesChange</code> receives the <code>File</code> objects.
        </p>
        <ComponentPreview name="file-input-multiple">
          <FileInputMultiple />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Accept, errors and disabled">
        <p>
          <code>accept</code> filters the picker and dropped files. The button content can be any node, such as an icon
          and text.
        </p>
        <ComponentPreview name="file-input-accept">
          <FileInputAccept />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Forms">
        <p>
          The native input carries <code>name</code>, <code>required</code> and the selected files, and the path field
          clears on form reset.
        </p>
        <ComponentPreview name="file-input-form">
          <FileInputForm />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          props={[
            { name: "label", type: "ReactNode", description: "Floating label of the path field." },
            { name: "placeholder", type: "string", description: "Placeholder of the path field." },
            { name: "buttonLabel", type: "ReactNode", default: '"File"', description: "Button content." },
            { name: "helperText", type: "ReactNode", description: "Text under the field." },
            { name: "error", type: "ReactNode | boolean", description: "true or an error message." },
            { name: "multiple", type: "boolean", default: "false", description: "Allow several files." },
            { name: "accept", type: "string", description: "Accepted types, e.g. image/* or .pdf (also filters dropped files)." },
            { name: "onFilesChange", type: "(files: File[]) => void", description: "Called with the selected files after every change." },
            { name: "clearable", type: "boolean", default: "false", description: "Show a clear button when files are selected." },
            { name: "dropzone", type: "boolean", default: "true", description: "Accept files dropped onto the field." },
            { name: "formatFiles", type: "(files: File[]) => string", description: "Custom path text." },
            { name: "buttonClassName / pathClassName", type: "string", description: "Classes for the button and the path field. className goes on the wrapper." },
          ]}
        />
        <p>
          Other <code>&lt;input&gt;</code> props (<code>name</code>, <code>required</code>, <code>capture</code>,{" "}
          <code>ref</code>, <code>onChange</code>...) go to the native file input.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            The native <code>&lt;input type=&quot;file&quot;&gt;</code> is visually hidden but stays in the tab order. When
            it has focus, the button shows the focus ring; Enter or Space opens the file picker.
          </li>
          <li>Its name combines the button text and the label; helper and error text are linked with aria-describedby.</li>
          <li>The read-only path field is skipped in the tab order, and clicking it also opens the picker.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
