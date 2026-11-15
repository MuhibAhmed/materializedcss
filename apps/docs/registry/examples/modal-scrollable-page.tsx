import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal";

export function ModalScrollablePage() {
  return (
    <Modal preventScrolling={false}>
      <ModalTrigger asChild>
        <Button variant="outlined" color="secondary">
          Open without scroll lock
        </Button>
      </ModalTrigger>
      <ModalContent aria-describedby={undefined}>
        <ModalHeader>
          <ModalTitle>Page still scrolls</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>With preventScrolling off you can scroll the page behind, but Tab still stays inside the modal.</p>
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="flat">Close</Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
