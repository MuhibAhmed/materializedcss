import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/icons";
import { Modal, ModalBody, ModalClose, ModalContent, ModalTitle, ModalTrigger } from "@/components/ui/modal";

const apps = [
  { icon: "mail", label: "Email" },
  { icon: "message", label: "Messages" },
  { icon: "content_copy", label: "Copy link" },
  { icon: "print", label: "Print" },
];

export function ModalBottomSheet() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="outlined" color="secondary">
          Share
        </Button>
      </ModalTrigger>
      <ModalContent variant="bottom-sheet" aria-describedby={undefined}>
        <ModalBody>
          <ModalTitle className="mb-4 text-xl">Share with</ModalTitle>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {apps.map((app) => (
              <li key={app.label}>
                <ModalClose asChild>
                  <Button variant="flat" className="h-12 w-full justify-start normal-case">
                    <MaterialIcon name={app.icon} className="text-muted-foreground" />
                    {app.label}
                  </Button>
                </ModalClose>
              </li>
            ))}
          </ul>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
