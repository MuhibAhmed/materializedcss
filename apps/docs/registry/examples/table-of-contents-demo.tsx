import { Pushpin } from "@/components/ui/pushpin";
import { TableOfContents, type TableOfContentsItem } from "@/components/ui/table-of-contents";

const sections = [
  { id: "toc-introduction", title: "Introduction" },
  { id: "toc-structure", title: "Structure" },
  { id: "toc-initialization", title: "Initialization" },
  { id: "toc-options", title: "Options" },
  { id: "toc-methods", title: "Methods" },
];

const items: TableOfContentsItem[] = sections.map(({ id, title }) => ({ id, label: title }));

export function TableOfContentsDemo() {
  return (
    <div className="grid w-full gap-8 md:grid-cols-[1fr_180px]">
      <article className="space-y-10 md:order-first">
        {sections.map(({ id, title }) => (
          <section key={id} id={id} aria-labelledby={`${id}-title`} className="scroll-mt-4 outline-none">
            <h3 id={`${id}-title`} className="text-xl font-normal text-foreground">
              {title}
            </h3>
            <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
              <div>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus
                posuere velit aliquet. Donec ullamcorper nulla non metus auctor fringilla. Maecenas faucibus mollis
                interdum. Cras mattis consectetur purus sit amet fermentum.
              </div>
              <div>
                Vestibulum id ligula porta felis euismod semper. Nullam quis risus eget urna mollis ornare vel eu leo.
                Aenean lacinia bibendum nulla sed consectetur. Etiam porta sem malesuada magna mollis euismod. Sed posuere
                consectetur est at lobortis.
              </div>
              <div>
                Curabitur blandit tempus porttitor. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce
                dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet
                risus.
              </div>
            </div>
          </section>
        ))}
      </article>
      <aside className="max-md:order-first">
        {/* 88px clears the 64px sticky site header. */}
        <Pushpin top={88} className="max-md:static">
          <TableOfContents items={items} aria-label="Demo contents" />
        </Pushpin>
      </aside>
    </div>
  );
}
