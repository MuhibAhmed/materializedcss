import { Switch } from "@/components/ui/switch";

export function SwitchDemo() {
  return (
    <div className="flex flex-col items-start gap-6">
      <Switch aria-label="Wi-Fi" offLabel="Off" onLabel="On" defaultChecked />
      <Switch label="Airplane mode" />
    </div>
  );
}
