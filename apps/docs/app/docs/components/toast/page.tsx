import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { Callout, DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { ToastDemo } from "~/registry/examples/toast-demo";
import { ToastStyles } from "~/registry/examples/toast-styles";
import { ToastUndo } from "~/registry/examples/toast-undo";

export const metadata: Metadata = { title: "Toast" };

export default function ToastPage(): React.JSX.Element {
  return (
    <ComponentDoc name="toast">
      <ComponentPreview name="toast-demo">
        <ToastDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="toast" />
      </DocSection>

      <DocSection title="Usage">
        <p>
          Mount one <code>Toaster</code>, for example in your root layout, then call <code>toast()</code> from anywhere
          in client code.
        </p>
        <CodeBlock
          code={`// app/layout.tsx
import { Toaster } from "@/components/ui/toast";

<body>
  {children}
  <Toaster />
</body>`}
        />
        <CodeBlock
          className="mt-3"
          code={`import { toast } from "@/components/ui/toast";

toast("I am a toast!");
const id = toast({ content: "Uploading…", duration: Infinity });
toast.dismiss(id);
toast.dismissAll();`}
        />
        <Callout>
          Only the first mounted <code>Toaster</code> renders, so an extra one (like the one in each example on this
          page) never shows a toast twice.
        </Callout>
      </DocSection>

      <DocSection title="Action">
        <p>
          Pass an <code>action</code> to add a button such as <em>Undo</em>. Clicking it runs your handler and then
          dismisses the toast. Call <code>event.preventDefault()</code> in the handler to keep the toast open.
        </p>
        <ComponentPreview name="toast-undo">
          <ToastUndo />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Styles">
        <p>
          Use <code>variant=&quot;rounded&quot;</code> for a pill shape and <code>classes</code> for custom colors.{" "}
          <code>type=&quot;error&quot;</code> makes screen readers announce the toast right away.{" "}
          <code>duration: Infinity</code> keeps a toast until it is dismissed.
        </p>
        <ComponentPreview name="toast-styles">
          <ToastStyles />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Placement and dismissal">
        <ul>
          <li>Large screens (993px and up): top right, 10% from the top and 7% from the right.</li>
          <li>Medium screens (601 to 992px): bottom left, 7% from the bottom and 5% from the left.</li>
          <li>Small screens: full width at the bottom, with square corners.</li>
          <li>
            Swipe a toast sideways past 80% of its width, or fling it, to dismiss it. Shorter drags spring back.
          </li>
          <li>When more toasts arrive than <code>max</code>, the extra ones wait and appear as earlier ones close.</li>
        </ul>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="toast(options)"
          props={[
            { name: "content", type: "ReactNode", description: "The message. Rendered as React, never as an HTML string." },
            { name: "action", type: "{ label, onClick, altText? }", description: "Optional action button." },
            { name: "duration", type: "number", default: "4000", description: "Display time in ms. Infinity keeps it open." },
            { name: "classes", type: "string", description: "Extra classes for the toast (Materialize classes)." },
            { name: "variant", type: '"default" | "rounded"', default: '"default"', description: "Shape." },
            { name: "type", type: '"default" | "error"', default: '"default"', description: "Errors are announced assertively." },
            { name: "closeButton", type: "boolean", description: "Show a dismiss button. Defaults to the Toaster setting." },
            { name: "id", type: "string", description: "Reuse an id to update a toast that is showing." },
            { name: "onDismiss", type: "(id: string) => void", description: "Called after the toast is removed." },
          ]}
        />
        <PropsTable
          title="Toaster"
          props={[
            { name: "max", type: "number", default: "3", description: "How many toasts are visible at once." },
            { name: "duration", type: "number", default: "4000", description: "Default display time in ms." },
            { name: "closeButton", type: "boolean", default: "false", description: "Show a dismiss button on every toast." },
            { name: "label", type: "string", default: '"Notifications"', description: "Name of the notifications region." },
            { name: "className", type: "string", description: "Classes for the fixed container." },
          ]}
        />
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            Toasts are announced through live regions that are always in the page: <code>role=&quot;status&quot;</code>{" "}
            for normal toasts and <code>role=&quot;alert&quot;</code> for errors.
          </li>
          <li>
            Timers pause while the pointer is over a toast, while a toast has keyboard focus, and while the window is in
            the background, so there is time to read it and reach the action.
          </li>
          <li>
            <kbd>Escape</kbd> dismisses the focused toast. Keep important actions somewhere else in the page too, since
            toasts go away on their own.
          </li>
          <li>Animations are turned off when the user prefers reduced motion.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
