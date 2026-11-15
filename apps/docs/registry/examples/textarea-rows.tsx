import { Textarea } from "@/components/ui/textarea";

export function TextareaRows() {
  return (
    <div className="grid w-full max-w-xl grid-cols-1 gap-x-6 sm:grid-cols-2">
      <Textarea label="At least 3 rows" minRows={3} />
      <Textarea label="At most 4 rows" maxRows={4} helperText="Scrolls after 4 lines" />
      <Textarea variant="outlined" label="Outlined" minRows={2} />
      <Textarea label="Disabled" disabled defaultValue={"Line one\nLine two"} />
    </div>
  );
}
