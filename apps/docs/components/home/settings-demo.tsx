"use client";

import * as React from "react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Range } from "@/components/ui/range";
import { Select, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

function SettingSwitch({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}): React.JSX.Element {
  const id = React.useId();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-foreground">
          {label}
        </label>
        <p id={`${id}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch id={id} aria-describedby={`${id}-description`} defaultChecked={defaultChecked} />
    </div>
  );
}

/** Switches, a Radix select and a range slider in a settings panel. */
export function SettingsDemo(): React.JSX.Element {
  const [volume, setVolume] = React.useState<number[]>([60]);
  const volumeId = React.useId();

  return (
    <Card>
      <CardContent>
        <CardTitle>Settings</CardTitle>
        <div className="divide-y divide-border">
          <SettingSwitch label="Push notifications" description="Alerts on this device" defaultChecked />
          <SettingSwitch label="Weekly digest" description="A summary every Monday" />
        </div>
        <div className="mt-4">
          <Select label="Sync frequency" defaultValue="hourly">
            <SelectItem value="realtime">Real time</SelectItem>
            <SelectItem value="hourly">Every hour</SelectItem>
            <SelectItem value="daily">Once a day</SelectItem>
            <SelectItem value="manual">Manually</SelectItem>
          </Select>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline justify-between">
            <span id={volumeId} className="text-sm text-muted-foreground">
              Alert volume
            </span>
            <output aria-hidden="true" className="text-sm tabular-nums text-muted-foreground">
              {volume[0]}%
            </output>
          </div>
          <Range aria-labelledby={volumeId} value={volume} onValueChange={setVolume} className="mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}
