import Link from "next/link";

import { ComponentMosaic } from "~/components/home/component-mosaic";
import { Hero } from "~/components/home/hero";
import { HomeFooter } from "~/components/home/home-footer";
import { Improvements } from "~/components/home/improvements";
import { ThemeSection } from "~/components/home/theme-section";
import { SiteHeader } from "~/components/site-header";
import { getComponentNav } from "~/lib/registry";

export default function HomePage(): React.JSX.Element {
  const nav = getComponentNav();
  const componentsHref = nav[0]?.items[0]?.href ?? "/docs/components/button";
  const componentCount = nav.reduce((total, section) => total + section.items.length, 0);

  return (
    <>
      <SiteHeader />
      <main id="main" className="overflow-x-clip">
        <Hero componentsHref={componentsHref} />
        <ComponentMosaic />
        <p className="mx-auto max-w-[1280px] px-4 pt-4 text-center text-muted-foreground sm:px-6">
          Every card above is built from the real components.{" "}
          <Link
            href={componentsHref}
            className="rounded-ui font-medium text-link underline decoration-current/45 underline-offset-[3px] outline-none hover:decoration-current focus-visible:focus-ring"
          >
            Browse all {componentCount} components
          </Link>
        </p>
        <Improvements />
        <ThemeSection />
      </main>
      <HomeFooter componentsHref={componentsHref} componentCount={componentCount} />
    </>
  );
}
