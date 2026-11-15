"use client";

import * as React from "react";

const subscribe = (): (() => void) => () => {};

/**
 * Renders `children` only after hydration. For examples that depend on the
 * current date: a statically rendered page would otherwise show the build day
 * and mismatch the visitor's "today" when React hydrates.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.ReactNode {
  const hydrated = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return hydrated ? children : fallback;
}
