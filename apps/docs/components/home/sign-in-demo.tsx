"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";

/** Text fields with floating labels, a checkbox and a raised submit button. */
export function SignInDemo(): React.JSX.Element {
  const titleId = React.useId();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    toast(`Signed in as ${email}`);
  };

  return (
    <Card>
      <form aria-labelledby={titleId} onSubmit={onSubmit}>
        <CardContent className="pb-4">
          <CardTitle id={titleId}>Sign in</CardTitle>
          <p className="mb-2! text-sm text-muted-foreground">Use your account to continue.</p>
          <TextField label="Email" type="email" name="email" autoComplete="off" required validate />
          <TextField label="Password" type="password" name="password" autoComplete="off" required minLength={6} />
          <Checkbox label="Keep me signed in" name="remember" defaultChecked containerClassName="mt-2" />
        </CardContent>
        <CardAction className="justify-between gap-2">
          <Button variant="flat" color="secondary" onClick={() => toast("Password reset link sent")}>
            Forgot?
          </Button>
          <Button type="submit">Sign in</Button>
        </CardAction>
      </form>
    </Card>
  );
}
