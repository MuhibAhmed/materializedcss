"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { FileInput } from "@/components/ui/file-input";

export function FileInputForm() {
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form
      className="w-full max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        const files = new FormData(event.currentTarget)
          .getAll("documents")
          .map((entry) => (typeof entry === "string" ? entry : entry.name))
          .filter(Boolean);
        setSubmitted(JSON.stringify({ documents: files }));
      }}
    >
      <FileInput label="Documents" name="documents" multiple required />
      <div className="mt-4 flex gap-3">
        <Button type="submit">Upload</Button>
        <Button type="reset" variant="flat">
          Reset
        </Button>
      </div>
      <output aria-label="Submitted values" className="mt-4 block font-mono text-sm text-muted-foreground">
        {submitted}
      </output>
    </form>
  );
}
