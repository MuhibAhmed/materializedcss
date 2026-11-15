import { FileInput } from "@/components/ui/file-input";
import { MaterialIcon } from "@/components/ui/icons";

export function FileInputAccept() {
  return (
    <div className="w-full max-w-md">
      <FileInput
        label="Profile photo"
        accept="image/*"
        buttonLabel={
          <>
            <MaterialIcon name="photo_camera" />
            Photo
          </>
        }
        helperText="PNG, JPG or GIF"
      />
      <FileInput label="Contract" accept=".pdf" error="A signed PDF is required" />
      <FileInput label="Disabled" disabled />
    </div>
  );
}
