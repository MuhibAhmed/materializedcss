import Link from "next/link";

import { CommandMenu } from "~/components/command-menu";
import { MobileNav } from "~/components/mobile-nav";
import { ModeToggle } from "~/components/mode-toggle";
import { getComponentNav } from "~/lib/registry";
import { designNav, examplesNav, gettingStartedNav, siteConfig } from "~/lib/site";

/**
 * The mark: an M folded from one strip of Material paper (red to the teal accent), with a
 * Waves ripple. Same artwork as `.github/assets/logo.svg` and `app/icon.svg`.
 */
export function Logo({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg viewBox="0 0 128 128" width="32" height="32" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="mz-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4868a" />
          <stop offset="1" stopColor="#e0484f" />
        </linearGradient>
        <linearGradient id="mz-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1f1" />
          <stop offset="1" stopColor="#f6c3c5" />
        </linearGradient>
        <linearGradient id="mz-teal" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2bbbad" />
          <stop offset="1" stopColor="#1c8379" />
        </linearGradient>
        <clipPath id="mz-tile">
          <rect width="128" height="128" rx="30" />
        </clipPath>
      </defs>
      <g clipPath="url(#mz-tile)">
        <rect width="128" height="128" fill="url(#mz-bg)" />
        <g fill="none" stroke="#fff" strokeWidth="3">
          <circle cx="106" cy="106" r="15" strokeOpacity=".28" />
          <circle cx="106" cy="106" r="30" strokeOpacity=".16" />
          <circle cx="106" cy="106" r="45" strokeOpacity=".08" />
        </g>
        <circle cx="106" cy="106" r="5" fill="#fff" fillOpacity=".55" />
      </g>
      <rect x="1.5" y="1.5" width="125" height="125" rx="28.5" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" />
      <path d="M26 96V34h16v62z" fill="#fff" />
      <path d="M26 34h16l22 30v24z" fill="url(#mz-back)" />
      <path d="M64 64l22-30h16L64 88z" fill="url(#mz-teal)" />
      <path d="M86 34h16v62H86z" fill="#fff" />
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
