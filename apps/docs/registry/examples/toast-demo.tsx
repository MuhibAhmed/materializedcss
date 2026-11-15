"use client";

import { Button } from "@/components/ui/button";
import { toast, Toaster } from "@/components/ui/toast";

export function ToastDemo() {
  return (
    <>
      <Button onClick={() => toast("I am a toast!")}>Toast!</Button>
      <Toaster />
    </>
  );
}
