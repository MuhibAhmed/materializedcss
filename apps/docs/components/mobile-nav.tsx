"use client";

import * as React from "react";
import { Dialog } from "radix-ui";

import { DocsNav } from "~/components/docs-sidebar";
import type { NavSection } from "~/lib/site";
import { MenuIcon } from "@/components/ui/icons";

/** Slide-out navigation drawer for small screens. */
export function MobileNav({ sections }: { sections: NavSection[] }): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open navigation"
          className="-ml-2 inline-flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-white/15 lg:hidden"
        >
          <MenuIcon className="size-6" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay data-[state=open]:animate-md-fade-in data-[state=closed]:animate-md-fade-out" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] overflow-y-auto bg-surface p-4 text-foreground shadow-z3 data-[state=open]:animate-md-slide-in-left data-[state=closed]:animate-md-slide-out-left"
        >
          <Dialog.Title className="mb-4 px-3 text-lg">materializedcss</Dialog.Title>
          <DocsNav sections={sections} onNavigate={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
