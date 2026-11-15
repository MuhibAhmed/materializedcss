import { FileInput } from "@/components/ui/file-input";

export function FileInputDemo() {
  return (
    <div className="w-full max-w-md">
      <FileInput label="Attachment" name="attachment" />
    </div>
  );
}
