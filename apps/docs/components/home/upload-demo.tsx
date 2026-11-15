"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CheckIcon } from "@/components/ui/icons";
import { Preloader } from "@/components/ui/preloader";
import { Progress } from "@/components/ui/progress";

const FILES = 12;

/** Spinner, determinate and indeterminate progress bars driven by a fake upload. */
export function UploadDemo(): React.JSX.Element {
  const [sent, setSent] = React.useState(5);
  const [running, setRunning] = React.useState(false);
  const done = sent >= FILES;

  React.useEffect(() => {
    if (!running || done) return;
    const timer = window.setTimeout(() => setSent((current) => Math.min(FILES, current + 1)), 180);
    return () => window.clearTimeout(timer);
  }, [running, done, sent]);

  React.useEffect(() => {
    if (done) setRunning(false);
  }, [done]);

  const start = (): void => {
    setSent(0);
    setRunning(true);
  };

  return (
    <Card>
      <CardContent>
        <CardTitle>Uploads</CardTitle>
        <div className="mt-2 flex items-center gap-4">
          {done ? (
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-success text-success-foreground">
              <CheckIcon className="size-5" />
            </span>
          ) : (
            <Preloader size="sm" multicolor label="Uploading photos" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-foreground" aria-live="polite">
              {done ? "Upload complete" : "Uploading photos"}
            </p>
            <p className="text-sm tabular-nums text-muted-foreground">
              {sent} of {FILES} files
            </p>
          </div>
        </div>
        <Progress
          className="mt-4"
          value={sent}
          max={FILES}
          label="Photo upload"
          valueText={`${sent} of ${FILES} files`}
        />
        <p className="mb-2! mt-5! text-sm text-muted-foreground">Indexing library</p>
        <Progress label="Indexing library" color="primary" />
        <Button variant="flat" color="secondary" className="-ml-4 mt-4" disabled={running} onClick={start}>
          {done ? "Upload again" : "Restart upload"}
        </Button>
      </CardContent>
    </Card>
  );
}
