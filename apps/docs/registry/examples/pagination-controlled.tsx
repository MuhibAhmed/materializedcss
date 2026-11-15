"use client";

import * as React from "react";

import { PaginationControl } from "@/components/ui/pagination";

export function PaginationControlled() {
  const [page, setPage] = React.useState(6);
  return (
    <div className="flex flex-col items-center gap-4">
      <PaginationControl aria-label="Results pages" page={page} total={20} onPageChange={setPage} />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing page {page} of 20
      </p>
    </div>
  );
}
