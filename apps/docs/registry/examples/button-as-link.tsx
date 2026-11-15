import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ButtonAsLink() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Button asChild>
        <Link href="/docs">Read the docs</Link>
      </Button>
      <Button asChild variant="flat" color="secondary">
        <a href="#installation">Installation</a>
      </Button>
    </div>
  );
}
