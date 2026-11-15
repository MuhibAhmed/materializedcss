"use client";

import { PaginationControl } from "@/components/ui/pagination";

export function PaginationLinks() {
  return (
    <PaginationControl
      aria-label="Blog pages"
      defaultPage={3}
      total={10}
      siblingCount={2}
      getHref={(page) => `#page-${page}`}
    />
  );
}
