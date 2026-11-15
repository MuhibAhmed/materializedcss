import { Callout, DocHeader, PagerLinks } from "~/components/docs/doc-parts";
import { getComponentNav, getRegistryItem } from "~/lib/registry";
import { CheckIcon } from "@/components/ui/icons";

/**
 * Layout for a component page: title and description from the registry meta,
 * the "Improved from Materialize" callout, the page body and prev/next links.
 */
export function ComponentDoc({ name, children }: { name: string; children: React.ReactNode }): React.JSX.Element {
  const item = getRegistryItem(name);
  if (!item) throw new Error(`Unknown registry item "${name}"`);

  const flat = getComponentNav().flatMap((section) => section.items);
  const index = flat.findIndex((entry) => entry.href === `/docs/components/${name}`);

  return (
    <article data-doc-content>
      <DocHeader eyebrow={item.category ?? "Component"} title={item.title} description={item.description} />
      {item.improvements?.length ? (
        <Callout title="Improved from Materialize" tone="success">
          <ul className="!list-none !pl-0">
            {item.improvements.map((text) => (
              <li key={text} className="flex gap-2">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-secondary" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </Callout>
      ) : null}
      {children}
      <PagerLinks prev={index > 0 ? flat[index - 1] : undefined} next={index >= 0 ? flat[index + 1] : undefined} />
    </article>
  );
}
