import { Textarea } from "@/components/ui/textarea";

export function TextareaCounter() {
  return (
    <div className="w-full max-w-md">
      <Textarea label="Short bio" maxLength={120} showCount />
    </div>
  );
}
