import Link from "next/link";

import { CommandMenu } from "~/components/command-menu";
import { MobileNav } from "~/components/mobile-nav";
import { ModeToggle } from "~/components/mode-toggle";
import { getComponentNav } from "~/lib/registry";
import { designNav, examplesNav, gettingStartedNav, siteConfig } from "~/lib/site";

export function Logo({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="6" fill="currentColor" opacity="0.18" />
      <path d="M7 23V9l9 9 9-9v14" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Materialize-style app bar: colored, elevated, 64px. */
export function SiteHeader(): React.JSX.Element {
  const sections = [gettingStartedNav, designNav, examplesNav, ...getComponentNav()];
  return (
    <header className="sticky top-0 z-40 bg-primary text-white shadow-z1 dark:bg-[#2a1f20]">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-2 px-4 sm:h-16 sm:px-6">
        <MobileNav sections={sections} />
        <Link href="/" className="flex items-center gap-2 text-xl font-normal tracking-tight sm:text-2xl">
          <Logo />
          <span>{siteConfig.name}</span>
        </Link>
        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 text-[15px] lg:flex">
          <Link href="/docs" className="rounded-sm px-3 py-2 transition-colors hover:bg-white/15">
            Docs
          </Link>
          <Link href="/docs/components/button" className="rounded-sm px-3 py-2 transition-colors hover:bg-white/15">
            Components
          </Link>
          <Link href="/docs/colors" className="rounded-sm px-3 py-2 transition-colors hover:bg-white/15">
            Colors
          </Link>
          <Link href="/docs/theming" className="rounded-sm px-3 py-2 transition-colors hover:bg-white/15">
            Theming
          </Link>
          <Link href="/examples/store" className="hidden rounded-sm px-3 py-2 transition-colors hover:bg-white/15 xl:inline-block">
            Store demo
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <CommandMenu sections={sections} />
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
