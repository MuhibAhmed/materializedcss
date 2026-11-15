import { Textarea } from "@/components/ui/textarea";

export function TextareaDemo() {
  return (
    <div className="w-full max-w-md">
      <Textarea label="Message" name="message" helperText="The field grows as you type" />
    </div>
  );
}
