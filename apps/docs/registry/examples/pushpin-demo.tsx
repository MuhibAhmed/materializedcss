"use client";

import * as React from "react";

import { Pushpin, type PushpinState } from "@/components/ui/pushpin";

const sections = ["Introduction", "Structure", "Initialization", "Options", "Methods"];

export function PushpinDemo() {
  const [state, setState] = React.useState<PushpinState>("pin-top");

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-2 text-sm text-muted-foreground" aria-live="polite">
        Pushpin state: <strong className="font-medium text-foreground">{state}</strong>
      </div>
      <div
        tabIndex={0}
        role="region"
        aria-label="Scrollable article"
        className="h-[360px] overflow-y-auto rounded-ui border border-border bg-surface outline-none focus-visible:focus-ring"
      >
        <div className="px-6 py-8 text-muted-foreground">Scroll down to pin the card.</div>
        <div className="grid grid-cols-[1fr_180px] gap-6 px-6">
          <article className="space-y-6">
            {sections.map((title) => (
              <section key={title}>
                <h3 className="text-lg font-medium text-foreground">{title}</h3>
                <div className="mt-2 leading-relaxed text-muted-foreground">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus
                  posuere velit aliquet. Donec ullamcorper nulla non metus auctor fringilla. Cras mattis consectetur
                  purus sit amet fermentum.
                </div>
              </section>
            ))}
          </article>
          <aside>
            <Pushpin top={16} onPinChange={setState} className="rounded-ui bg-md-teal-700 p-4 text-sm text-white shadow-z1">
              I stay in view while this article scrolls, and stop at its end.
            </Pushpin>
          </aside>
        </div>
        <div className="mt-6 h-[300px] border-t border-border px-6 py-8 text-muted-foreground">
          The end of the article is the bottom boundary.
        </div>
      </div>
    </div>
  );
}
