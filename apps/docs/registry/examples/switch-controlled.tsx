"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function SwitchControlled() {
  const [enabled, setEnabled] = React.useState(false);

  return (
    <div className="flex flex-col items-start gap-4">
      <Switch
        label="Notifications"
        description="Get notified about new comments."
        checked={enabled}
        onCheckedChange={setEnabled}
      />
      <span className="text-sm text-muted-foreground">Notifications are {enabled ? "on" : "off"}</span>
      <Button variant="flat" onClick={() => setEnabled((value) => !value)}>
        Toggle from outside
      </Button>
    </div>
  );
}
