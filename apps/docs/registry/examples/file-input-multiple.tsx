"use client";

import * as React from "react";

import { FileInput } from "@/components/ui/file-input";

export function FileInputMultiple() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="w-full max-w-md">
      <FileInput
        multiple
        clearable
        placeholder="Upload one or more files"
        helperText={count > 0 ? `${count} file${count === 1 ? "" : "s"} selected` : "Or drop files here"}
        onFilesChange={(files) => setCount(files.length)}
      />
    </div>
  );
}
