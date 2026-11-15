import Link from "next/link";

import { SiteHeader } from "~/components/site-header";
import { Button } from "@/components/ui/button";

// Placeholder landing page; replaced by the full showcase.
export default function HomePage(): React.JSX.Element {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h1 className="text-h2 font-light">Material Design for React &amp; Tailwind</h1>
        <p className="flow-text mt-6 text-muted-foreground">Materialize, rebuilt.</p>
        <div className="mt-10 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/docs">Get started</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
