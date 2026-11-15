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

export function ModalFixedFooter() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button>Terms of service</Button>
      </ModalTrigger>
      <ModalContent variant="fixed-footer">
        <ModalHeader>
          <ModalTitle>Terms of service</ModalTitle>
          <ModalDescription>Scroll to read everything. The footer stays in place.</ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i}>
              {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis
              dapibus posuere velit aliquet. Donec ullamcorper nulla non metus auctor fringilla.
            </p>
          ))}
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button variant="flat">Decline</Button>
          </ModalClose>
          <ModalClose asChild>
            <Button variant="flat">Accept</Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
