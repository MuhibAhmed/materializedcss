import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal";

export function ModalDemo() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button>Open modal</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Modal Header</ModalTitle>
          <ModalDescription>A bunch of text describing what this dialog is about.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <p>
            Modals keep focus inside until they close, then return it to the button that opened them. Press Escape or
            click the overlay to dismiss.
          </p>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="flat">Disagree</Button>
          </ModalClose>
          <ModalClose asChild>
            <Button variant="flat">Agree</Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
