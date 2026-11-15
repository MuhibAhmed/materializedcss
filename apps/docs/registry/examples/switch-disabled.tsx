import { Switch } from "@/components/ui/switch";

export function SwitchDisabled() {
  return (
    <div className="flex flex-col items-start gap-6">
      <Switch label="Disabled" offLabel="Off" onLabel="On" disabled />
      <Switch label="Disabled on" offLabel="Off" onLabel="On" disabled defaultChecked />
    </div>
  );
}
