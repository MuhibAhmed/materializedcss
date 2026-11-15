"use client";

import { Button } from "@/components/ui/button";
import { toast, Toaster } from "@/components/ui/toast";

export function ToastUndo() {
  return (
    <>
      <Button
        onClick={() =>
          toast({
            content: "Message archived",
            action: { label: "Undo", onClick: () => toast("Message restored") },
            duration: 6000,
          })
        }
      >
        Archive
      </Button>
      <Toaster />
    </>
  );
}
