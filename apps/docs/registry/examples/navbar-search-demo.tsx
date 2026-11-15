"use client";

import * as React from "react";

import { Navbar, NavbarContent, NavbarSearch } from "@/components/ui/navbar";

export function NavbarSearchDemo() {
  const [query, setQuery] = React.useState("");
  const [submitted, setSubmitted] = React.useState<string | null>(null);
  return (
    <div className="flex w-full flex-col gap-4">
      <Navbar>
        <NavbarContent className="px-0 sm:px-0">
          <NavbarSearch value={query} onValueChange={setQuery} onSearch={setSubmitted} />
        </NavbarContent>
      </Navbar>
      <p className="px-4 text-sm text-muted-foreground" aria-live="polite">
        {submitted === null ? "Type and press Enter." : `Searched for "${submitted}"`}
      </p>
    </div>
  );
}
