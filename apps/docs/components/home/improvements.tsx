import Link from "next/link";

import { MaterialIcon } from "@/components/ui/icons";

interface Improvement {
  icon: string;
  title: string;
  text: string;
  href: string;
  link: string;
}

const FIXES: Improvement[] = [
  {
    icon: "phone_iphone",
    title: "No more iOS select mis-taps",
    text: "Materialize's select picked the wrong option on iOS. Select is now built on Radix Select, and NativeSelect uses the platform picker.",
    href: "/docs/components/select",
    link: "Select",
  },
  {
    icon: "layers",
    title: "Dropdowns escape modals",
    text: "Menus no longer get clipped by a modal or an overflow container. They render in a portal and flip or shift to stay on screen.",
    href: "/docs/components/dropdown-menu",
    link: "Dropdown menu",
  },
  {
    icon: "straighten",
    title: "Tab indicator stays put",
    text: "The sliding indicator used to drift after fonts loaded or the window resized. A ResizeObserver now measures the active tab.",
    href: "/docs/components/tabs",
    link: "Tabs",
  },
  {
    icon: "text_fields",
    title: "Labels float after autofill",
    text: "Floating labels used to sit on top of autofilled values. CSS :placeholder-shown and :autofill now float them, with no JavaScript.",
    href: "/docs/components/text-field",
    link: "Text field",
  },
  {
    icon: "security",
    title: "XSS fixes",
    text: "Toast, tooltip and autocomplete took HTML strings (CVE-2019-11002, 11003 and 11004). Their content is now React nodes only.",
    href: "/docs/components/tooltip",
    link: "Tooltip",
  },
  {
    icon: "event",
    title: "Datepicker closes on Escape",
    text: "Closing Materialize's datepicker with Escape never fired onClose. Now onOpenChange runs on every close path, and focus returns to the field.",
    href: "/docs/components/datepicker",
    link: "Datepicker",
  },
  {
    icon: "accessibility_new",
    title: "Real ARIA, no leaking listeners",
    text: "Global listeners stayed attached after components unmounted. Overlays now use Radix and WAI-ARIA patterns, with focus traps and keyboard navigation.",
    href: "/docs/components/modal",
    link: "Modal",
  },
  {
    icon: "swipe",
    title: "Carousel lets the page scroll",
    text: "Touching the carousel used to block vertical scrolling on phones. Pointer Events and touch-action now let vertical swipes through to the page.",
    href: "/docs/components/carousel",
    link: "Carousel",
  },
];

const DEFAULTS: Improvement[] = [
  {
    icon: "dark_mode",
    title: "Dark mode",
    text: "Every token has a dark value. Add the .dark class and it switches.",
    href: "/docs/dark-mode",
    link: "Dark mode",
  },
  {
    icon: "palette",
    title: "CSS-variable theming",
    text: "Change the primary, secondary and radius with a few CSS variables. No Sass rebuild.",
    href: "/docs/theming",
    link: "Theming",
  },
  {
    icon: "motion_photos_paused",
    title: "Reduced motion",
    text: "Ripples, slides and spinners calm down when the OS asks for less motion.",
    href: "/docs/components/button",
    link: "Button ripples",
  },
  {
    icon: "contrast",
    title: "AA contrast",
    text: "The default palette is tuned so text on primary, secondary and surfaces meets WCAG AA.",
    href: "/docs/colors",
    link: "Colors",
  },
];

function ImprovementCard({
  item,
  accent,
  heading: Heading,
}: {
  item: Improvement;
  accent: "primary" | "secondary";
  heading: "h3" | "h4";
}): React.JSX.Element {
  return (
    <li className="flex flex-col rounded-ui bg-surface p-6 shadow-z1 transition-shadow duration-250 hover:shadow-z2">
      <span
        aria-hidden="true"
        className={
          accent === "primary"
            ? "mb-4 inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground"
            : "mb-4 inline-flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
        }
      >
        <MaterialIcon name={item.icon} className="text-[22px]" />
      </span>
      <Heading className="text-lg font-medium leading-snug text-foreground">{item.title}</Heading>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
      <p className="mt-4 text-sm">
        <Link
          href={item.href}
          className="rounded-ui font-medium text-link underline decoration-current/45 underline-offset-[3px] outline-none hover:decoration-current focus-visible:focus-ring"
        >
          {item.link}
          <span className="sr-only"> docs</span>
        </Link>
      </p>
    </li>
  );
}

/** Grid of concrete bugs fixed and defaults improved compared to Materialize. */
export function Improvements(): React.JSX.Element {
  return (
    <section aria-labelledby="improvements-title" className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">Same look, fewer bugs</p>
        <h2 id="improvements-title" className="mt-2 text-[2rem] font-light leading-tight sm:text-h4">
          Improvements over Materialize
        </h2>
        <p className="mt-4 text-lg font-light leading-relaxed text-muted-foreground">
          Materialize&apos;s long-standing issues, fixed at the source. Each component page lists what changed.
        </p>
      </div>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FIXES.map((item) => (
          <ImprovementCard key={item.title} item={item} accent="secondary" heading="h3" />
        ))}
      </ul>
      <h3 className="mt-14 text-xl font-normal text-foreground">Better defaults</h3>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {DEFAULTS.map((item) => (
          <ImprovementCard key={item.title} item={item} accent="primary" heading="h4" />
        ))}
      </ul>
    </section>
  );
}
