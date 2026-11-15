"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

/** Buttons that fire toasts. The page mounts a single `<Toaster />`. */
export function SnackbarDemo(): React.JSX.Element {
  return (
    <Card>
      <CardContent>
        <CardTitle>Snackbars</CardTitle>
        <p className="mb-5! text-sm text-muted-foreground">
          Toasts take React nodes, never HTML strings, and screen readers announce them.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => toast("I am a toast!")}>Toast</Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() =>
              toast({
                content: "Conversation archived",
                action: { label: "Undo", onClick: () => toast("Conversation restored") },
                duration: 6000,
              })
            }
          >
            Archive
          </Button>
          <Button variant="flat" color="secondary" onClick={() => toast({ content: "Rounded toast", variant: "rounded" })}>
            Rounded
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
