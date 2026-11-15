"use client";

import * as React from "react";

import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";

const steps = [
  { id: "spy-plan", title: "Plan" },
  { id: "spy-build", title: "Build" },
  { id: "spy-test", title: "Test" },
  { id: "spy-ship", title: "Ship" },
];
const ids = steps.map((step) => step.id);

export function TableOfContentsHook() {
  const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
  const active = useScrollSpy(ids, { root, scrollOffset: 48 });

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-ui border border-border bg-surface">
      <nav aria-label="Steps" className="flex gap-1 border-b border-border p-2">
        {steps.map((step) => (
          <a
            key={step.id}
            href={`#${step.id}`}
            data-slot="spy-chip"
            aria-current={active === step.id ? "location" : undefined}
            onClick={(event) => {
              event.preventDefault();
              document.getElementById(step.id)?.scrollIntoView({ block: "start" });
            }}
            className={cn(
              "rounded-full px-3 py-1 text-sm no-underline transition-colors outline-none focus-visible:focus-ring",
              active === step.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-hover",
            )}
          >
            {step.title}
          </a>
        ))}
      </nav>
      <div
        ref={setRoot}
        tabIndex={0}
        role="region"
        aria-label="Steps content"
        className="h-64 overflow-y-auto px-4 outline-none focus-visible:focus-ring"
      >
        {steps.map((step) => (
          <section key={step.id} id={step.id} className="min-h-48 py-4">
            <h3 className="text-lg font-medium text-foreground">{step.title}</h3>
            <div className="mt-2 text-muted-foreground">
              Scroll this box: the chip of the step you are reading is highlighted. Integer posuere erat a ante venenatis
              dapibus posuere velit aliquet. Donec ullamcorper nulla non metus auctor fringilla.
            </div>
          </section>
        ))}
        <div className="h-32" />
      </div>
    </div>
  );
}
