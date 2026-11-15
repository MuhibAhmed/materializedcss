"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal";

export function ModalNonDismissible() {
  const [open, setOpen] = React.useState(false);
  const [choice, setChoice] = React.useState<string | null>(null);

  const decide = (value: string) => {
    setChoice(value);
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Modal open={open} onOpenChange={setOpen} dismissible={false}>
        <ModalTrigger asChild>
          <Button>Delete project</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete project?</ModalTitle>
            <ModalDescription>Escape and overlay clicks are ignored. Choose an option to continue.</ModalDescription>
          </ModalHeader>
          <ModalBody>
            <p>This removes the project and all of its files. It cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={() => decide("kept")}>
              Cancel
            </Button>
            <Button variant="flat" color="error" onClick={() => decide("deleted")}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {choice ? `Project ${choice}.` : "No decision yet."}
      </p>
    </div>
  );
}
