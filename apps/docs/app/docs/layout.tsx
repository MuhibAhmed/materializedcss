import { DocsNav } from "~/components/docs-sidebar";
import { SiteHeader } from "~/components/site-header";
import { TableOfContents } from "~/components/toc";
import { getComponentNav } from "~/lib/registry";
import { designNav, gettingStartedNav } from "~/lib/site";

export default function DocsLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  const sections = [gettingStartedNav, designNav, ...getComponentNav()];
  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex max-w-[1440px] gap-8 px-4 sm:px-6">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 overflow-y-auto py-8 lg:block">
          <DocsNav sections={sections} />
        </aside>
        <main id="main" className="min-w-0 flex-1 py-8 lg:py-10">
          <div className="mx-auto max-w-[860px]">{children}</div>
        </main>
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-52 shrink-0 overflow-y-auto py-10 xl:block">
          <TableOfContents />
        </aside>
      </div>
    </>
  );
}
