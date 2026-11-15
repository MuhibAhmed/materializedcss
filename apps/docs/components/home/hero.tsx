import Link from "next/link";

import { CopyButton } from "~/components/docs/copy-button";
import { Button } from "@/components/ui/button";

const INSTALL_COMMAND = "npx materializedcss init";
const STACK = ["React 19", "Tailwind v4", "TypeScript", "Radix", "MIT"] as const;

export interface HeroProps {
  /** Docs page of the first component in the sidebar. */
  componentsHref: string;
}

/**
 * Materialize-style index banner: a primary band that continues the app bar, a
 * big light heading, the CTAs and the install command. The component mosaic
 * below overlaps the bottom of the band.
 */
export function Hero({ componentsHref }: HeroProps): React.JSX.Element {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-primary text-primary-foreground dark:bg-[#2a1f20] dark:text-white"
    >
      {/* Soft ink circles, a nod to Materialize's waves. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-32 size-[28rem] rounded-full bg-white/8 sm:size-[36rem]" />
        <div className="absolute -bottom-40 -left-20 size-[22rem] rounded-full bg-black/6 dark:bg-white/4" />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-4 pb-36 pt-14 sm:px-6 sm:pb-44 sm:pt-20 lg:pt-24">
        <div className="max-w-3xl">
          <ul aria-label="Built with" className="mb-6 flex flex-wrap gap-2">
            {STACK.map((item) => (
              <li
                key={item}
                className="rounded-full border border-current/35 px-3 py-0.5 text-xs font-medium tracking-wide"
              >
                {item}
              </li>
            ))}
          </ul>
          <h1 id="hero-title" className="text-[2.6rem] font-light leading-[1.1] tracking-tight sm:text-h3 lg:text-h2">
            Material Design components you can own.
          </h1>
          <p className="flow-text mt-6 max-w-2xl">
            Materialize&apos;s Material Design, rebuilt for React 19, Tailwind CSS v4 and TypeScript.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <Button asChild size="lg">
              <Link href="/docs">Get started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outlined"
              className="border-current/60 text-primary-foreground dark:text-white"
            >
              <Link href={componentsHref}>Browse components</Link>
            </Button>
            <Button asChild size="lg" variant="flat" className="text-primary-foreground hover:bg-white/15 dark:text-white">
              <Link href="/examples/store">See the store demo</Link>
            </Button>
          </div>
          <div
            data-slot="install-command"
            className="mt-8 inline-flex max-w-full items-center gap-2 rounded-ui bg-surface py-1.5 pl-4 pr-1.5 text-foreground shadow-z2"
          >
            <code className="min-w-0 truncate font-mono text-sm sm:text-[15px]">
              <span aria-hidden="true" className="select-none text-muted-foreground">
                ${" "}
              </span>
              {INSTALL_COMMAND}
            </code>
            <CopyButton value={INSTALL_COMMAND} className="shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
