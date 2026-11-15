import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { ComponentDoc } from "~/components/docs/component-doc";
import { ComponentPreview } from "~/components/docs/component-preview";
import { DocSection, PropsTable } from "~/components/docs/doc-parts";
import { Installation } from "~/components/docs/installation";
import { CollectionAvatars } from "~/registry/examples/collection-avatars";
import { CollectionDemo } from "~/registry/examples/collection-demo";
import { CollectionLinks } from "~/registry/examples/collection-links";
import { CollectionWithHeader } from "~/registry/examples/collection-with-header";

export const metadata: Metadata = { title: "Collection" };

export default function CollectionPage(): React.JSX.Element {
  return (
    <ComponentDoc name="collection">
      <ComponentPreview name="collection-demo">
        <CollectionDemo />
      </ComponentPreview>

      <DocSection title="Installation">
        <Installation name="collection" />
      </DocSection>

      <DocSection title="Usage">
        <CodeBlock code={`import { Collection, CollectionItem } from "@/components/ui/collection";`} />
        <CodeBlock
          className="mt-3"
          code={`<Collection aria-label="Names">
  <CollectionItem>Alvin</CollectionItem>
  <CollectionItem active>Brenda</CollectionItem>
</Collection>`}
        />
      </DocSection>

      <DocSection title="Links">
        <p>
          <code>CollectionNav</code> renders a labelled <code>&lt;nav&gt;</code> with a list of <code>CollectionLink</code>
          s. The <code>active</code> link gets <code>aria-current=&quot;page&quot;</code>. Use <code>asChild</code> to
          render a router link.
        </p>
        <ComponentPreview name="collection-links">
          <CollectionLinks />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Header and secondary content">
        <p>
          A <code>CollectionHeader</code> indents the items. <code>CollectionSecondary</code> aligns icons, badges or
          meta text to the right.
        </p>
        <ComponentPreview name="collection-with-header">
          <CollectionWithHeader />
        </ComponentPreview>
      </DocSection>

      <DocSection title="Avatar content">
        <p>
          Set <code>avatar</code> on an item for the 84px layout with a 42px circle on the left. Pass an image with{" "}
          <code>asChild</code> or an icon to <code>CollectionAvatar</code>.
        </p>
        <ComponentPreview name="collection-avatars">
          <CollectionAvatars />
        </ComponentPreview>
      </DocSection>

      <DocSection title="API Reference">
        <PropsTable
          title="CollectionItem"
          props={[
            { name: "avatar", type: "boolean", default: "false", description: "84px avatar layout with a left gutter." },
            { name: "active", type: "boolean", default: "false", description: "Secondary-colored highlight." },
          ]}
        />
        <PropsTable
          title="CollectionLink"
          props={[
            { name: "active", type: "boolean", default: "false", description: "Highlight and set aria-current=\"page\"." },
            { name: "asChild", type: "boolean", default: "false", description: "Render the child element instead of <a>." },
          ]}
        />
        <PropsTable
          title="CollectionAvatar"
          props={[{ name: "asChild", type: "boolean", default: "false", description: "Merge the avatar styles onto the child (an <img>)." }]}
        />
        <p>
          <code>Collection</code> renders <code>&lt;ul&gt;</code>; <code>CollectionHeader</code> and{" "}
          <code>CollectionItem</code> render <code>&lt;li&gt;</code>. All parts forward their element props.
        </p>
      </DocSection>

      <DocSection title="Accessibility">
        <ul>
          <li>Collections are real lists, so screen readers announce the number of items.</li>
          <li>Give a collection a name with <code>aria-label</code> or <code>aria-labelledby</code> pointing to its header.</li>
          <li>Link collections are navigation landmarks; the current link is announced as &quot;current page&quot;.</li>
          <li>Icon-only links in secondary content need an <code>aria-label</code>.</li>
        </ul>
      </DocSection>
    </ComponentDoc>
  );
}
