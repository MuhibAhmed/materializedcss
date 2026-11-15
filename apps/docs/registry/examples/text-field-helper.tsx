"use client";

import * as React from "react";

import { TextField } from "@/components/ui/text-field";

export function TextFieldHelper() {
  const [email, setEmail] = React.useState("not-an-email");
  const error = email.includes("@") ? undefined : "Enter a valid email address";

  return (
    <div className="w-full max-w-md">
      <TextField label="Website" helperText="Include https://" type="url" />
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={error}
        success={!error}
      />
    </div>
  );
}
