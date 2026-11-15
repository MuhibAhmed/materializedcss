"use client";

import { Button } from "@/components/ui/button";
import { toast, Toaster } from "@/components/ui/toast";

export function ToastStyles() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button onClick={() => toast({ content: "I am a rounded toast!", variant: "rounded" })}>Rounded</Button>
      <Button
        color="success"
        onClick={() => toast({ content: "Saved to drafts", classes: "bg-md-green-700 text-white" })}
      >
        Custom classes
      </Button>
      <Button color="error" onClick={() => toast({ content: "Upload failed. Check your connection.", type: "error" })}>
        Error
      </Button>
      <Button
        variant="outlined"
        onClick={() => toast({ content: "Stays until you close it", duration: Infinity, closeButton: true })}
      >
        Persistent
      </Button>
      <Button variant="flat" onClick={() => toast.dismissAll()}>
        Dismiss all
      </Button>
      <Toaster />
    </div>
  );
}
