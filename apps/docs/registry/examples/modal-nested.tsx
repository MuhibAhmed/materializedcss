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

export function ModalNested() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button>Edit profile</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit profile</ModalTitle>
          <ModalDescription>Modals can open other modals; each one stacks above the last.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <Modal>
            <ModalTrigger asChild>
              <Button variant="outlined" color="secondary">
                Change avatar
              </Button>
            </ModalTrigger>
            <ModalContent className="lg:w-[40%]">
              <ModalHeader>
                <ModalTitle>Change avatar</ModalTitle>
                <ModalDescription>Escape closes only this modal.</ModalDescription>
              </ModalHeader>
              <ModalFooter className="mt-4">
                <ModalClose asChild>
                  <Button variant="flat">Back</Button>
                </ModalClose>
              </ModalFooter>
            </ModalContent>
          </Modal>
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
