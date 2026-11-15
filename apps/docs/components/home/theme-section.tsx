import Link from "next/link";

import { ThemeCustomizer } from "~/components/theme-customizer";

/** Live theme picker: changes apply to the whole page, including the hero and examples above. */
export function ThemeSection(): React.JSX.Element {
  return (
    <section aria-labelledby="theme-title" className="border-y border-border bg-surface-2">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">Theming</p>
          <h2 id="theme-title" className="mt-2 text-[2rem] font-light leading-tight sm:text-h4">
            Make it yours
          </h2>
          <p className="mt-4 text-lg font-light leading-relaxed text-muted-foreground">
            Pick colors from the Materialize palette and a corner radius. The whole page updates as you click, and the
            generated CSS is ready to paste. Read more in the{" "}
            <Link
              href="/docs/theming"
              className="rounded-ui text-link underline decoration-current/45 underline-offset-[3px] outline-none hover:decoration-current focus-visible:focus-ring"
            >
              theming guide
            </Link>
            .
          </p>
        </div>
        <ThemeCustomizer className="mt-10" />
      </div>
    </section>
  );
}
