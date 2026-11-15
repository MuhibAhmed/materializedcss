import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { ModalBottomSheet } from "~/registry/examples/modal-bottom-sheet";
import { ModalDemo } from "~/registry/examples/modal-demo";
import { ModalFixedFooter } from "~/registry/examples/modal-fixed-footer";
import { ModalNested } from "~/registry/examples/modal-nested";
import { ModalNonDismissible } from "~/registry/examples/modal-non-dismissible";
import { ModalScrollablePage } from "~/registry/examples/modal-scrollable-page";

export const metadata: Metadata = { title: "Modal" };

export default function ModalPage(): React.JSX.Element {
  return (
    <ComponentDoc name="modal">
      <ComponentPreview name="modal-demo">
        <ModalDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="modal" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock
          code={`import {
  Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle,
  ModalDescription, ModalBody, ModalFooter, ModalClose,
} from "@/components/ui/modal";`}
        />
        <CodeBlock
          className="mt-3"
          code={`<Modal>
  <ModalTrigger asChild><Button>Open</Button></ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Title</ModalTitle>
      <ModalDescription>Description</ModalDescription>
    </ModalHeader>
    <ModalBody>…</ModalBody>
    <ModalFooter>
      <ModalClose asChild><Button variant="flat">Close</Button></ModalClose>
    </ModalFooter>
  </ModalContent>
</Modal>`}
        />
        <p>
          <code>ModalTitle</code> names the dialog. If you leave out <code>ModalDescription</code>, pass{" "}
          <code>aria-describedby={"{undefined}"}</code> to <code>ModalContent</code>.
        </p>
      </DocSection>

      <DocSection title="Fixed footer">
        <p>
          For long content. The modal is 70% of the viewport tall, the body scrolls, and the footer stays pinned with a
          top border.
        </p>
        <ComponentPreview name="modal-fixed-footer">
          <ModalFixedFooter />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Bottom sheet">
        <p>
          Full width, up to 45% of the viewport tall, and slides up from the bottom edge. Good for lists of choices on
          mobile.
        </p>
        <ComponentPreview name="modal-bottom-sheet">
          <ModalBottomSheet />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Non-dismissible">
        <p>
          With <code>dismissible={"{false}"}</code>, Escape and overlay clicks are ignored, so the user has to choose an
          action. This example also shows controlled <code>open</code> state.
        </p>
        <ComponentPreview name="modal-non-dismissible">
          <ModalNonDismissible />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Nested modals">
        <p>
          A modal can open another one. They stack in the order they were opened, and Escape closes only the top one.
          Materialize used a global z-index counter for this.
        </p>
        <ComponentPreview name="modal-nested">
          <ModalNested />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Page scrolling">
        <p>
          By default the page is locked while a modal is open. The lock makes room for the scrollbar so the layout does
          not shift, and it also works on iOS. Set <code>preventScrolling={"{false}"}</code> to let the page scroll.
          Focus still stays inside the modal.
        </p>
        <ComponentPreview name="modal-scrollable-page">
          <ModalScrollablePage />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="Modal"
          props={[
            { name: "open", type: "boolean", description: "Controlled open state." },
            { name: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
            { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the modal opens or closes." },
            { name: "dismissible", type: "boolean", default: "true", description: "Allow Escape and overlay clicks to close the modal." },
            { name: "preventScrolling", type: "boolean", default: "true", description: "Lock page scrolling while open." },
          ]}
        />
        <PropsTable
          title="ModalContent"
          props={[
            {
              name: "variant",
              type: '"default" | "fixed-footer" | "bottom-sheet"',
              default: '"default"',
              description: "Layout and animation.",
            },
            { name: "overlayClassName", type: "string", description: "Classes for the overlay." },
            { name: "container", type: "HTMLElement | null", description: "Portal container (defaults to document.body)." },
            {
              name: "onOpenAutoFocus / onCloseAutoFocus",
              type: "(event: Event) => void",
              description: "Change where focus goes on open or close (call event.preventDefault()).",
            },
          ]}
        />
        <p>
          <code>ModalTrigger</code> and <code>ModalClose</code> accept <code>asChild</code>. <code>ModalHeader</code>,{" "}
          <code>ModalBody</code> and <code>ModalFooter</code> are styled <code>&lt;div&gt;</code>s.{" "}
          <code>modalContentVariants()</code> is exported.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>
            <code>role=&quot;dialog&quot;</code> with <code>aria-labelledby</code> (title) and{" "}
            <code>aria-describedby</code> (description). Content behind the modal is hidden from assistive technology.
          </li>
          <li>
            <kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> move focus within the modal. <kbd>Escape</kbd> closes it (unless{" "}
            <code>dismissible</code> is false).
          </li>
          <li>Focus moves into the modal when it opens and returns to the trigger when it closes.</li>
          <li>Animations are turned off when the user prefers reduced motion.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
