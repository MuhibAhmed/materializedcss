import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const collectionBase =
  "relative m-0 list-none overflow-hidden rounded-ui border border-border p-0 text-foreground [&>li]:list-none";

// Items in a collection with a header are indented (Materialize `.with-header`).
const withHeader =
  "[&:has(>[data-slot=collection-header])>[data-slot=collection-item]:not([data-avatar])]:pl-[30px]";

/** Bordered list (Materialize `.collection`). Render `CollectionItem`s and optionally a `CollectionHeader` inside. */
export function Collection({ className, ...props }: React.ComponentProps<"ul">): React.JSX.Element {
  return <ul data-slot="collection" className={cn(collectionBase, withHeader, className)} {...props} />;
}

/** Header row of a collection, usually holding a heading (Materialize `.collection-header`). */
export function CollectionHeader({ className, ...props }: React.ComponentProps<"li">): React.JSX.Element {
  return (
    <li
      data-slot="collection-header"
      className={cn(
        "border-b border-border bg-surface px-5 py-2.5 [&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:my-2 [&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:font-normal [&_h4]:text-h4 [&_h4]:leading-[1.1]",
        className,
      )}
      {...props}
    />
  );
}

export interface CollectionItemProps extends React.ComponentProps<"li"> {
  /** Avatar layout: 84px tall with room for a `CollectionAvatar` on the left. */
  avatar?: boolean;
  /** Highlight the item with the secondary color. */
  active?: boolean;
}

const itemBase = "m-0 border-b border-border bg-surface leading-6 last:border-b-0";

/** A row of a collection (Materialize `.collection-item`). */
export function CollectionItem({ className, avatar = false, active = false, ...props }: CollectionItemProps): React.JSX.Element {
  return (
    <li
      data-slot="collection-item"
      data-avatar={avatar ? "" : undefined}
      data-active={active ? "" : undefined}
      className={cn(
        itemBase,
        "group/collection-item",
        avatar ? "relative block min-h-[84px] py-2.5 pr-5 pl-[72px]" : "flex items-center gap-x-4 px-5 py-2.5",
        active && "bg-secondary text-secondary-foreground",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Circular 42px image or icon at the start of an avatar item. Pass an `<img>`
 * (with `asChild`) or an icon as children.
 */
export function CollectionAvatar({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & {
  /** Merge the avatar styles onto the child element (e.g. an `<img>`). */
  asChild?: boolean;
}): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "span";
  return (
    <Comp
      data-slot="collection-avatar"
      className={cn(
        "absolute left-[15px] inline-flex size-[42px] items-center justify-center overflow-hidden rounded-full bg-md-grey-500 object-cover text-lg leading-[42px] text-white [&_.material-icons]:text-lg [&_svg]:size-[18px]",
        className,
      )}
      {...props}
    />
  );
}

/** Title line of an avatar item (16px). */
export function CollectionTitle({ className, ...props }: React.ComponentProps<"span">): React.JSX.Element {
  return <span data-slot="collection-title" className={cn("block text-base", className)} {...props} />;
}

/** Right-aligned secondary content: an icon link, a badge or meta text (Materialize `.secondary-content`). */
export interface CollectionSecondaryProps extends React.ComponentProps<"span"> {
  /** Merge props onto the single child (e.g. a link or button) instead of rendering a `<span>`. */
  asChild?: boolean;
}

export function CollectionSecondary({ className, asChild = false, ...props }: CollectionSecondaryProps): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "span";
  return (
    <Comp
      data-slot="collection-secondary"
      className={cn(
        "ml-auto inline-flex shrink-0 items-center gap-1 text-secondary group-data-[active]/collection-item:text-secondary-foreground",
        "group-data-[avatar]/collection-item:absolute group-data-[avatar]/collection-item:right-4 group-data-[avatar]/collection-item:top-4",
        "[&_a]:rounded-ui [&_a]:text-inherit [&_a]:outline-none [&_a]:focus-visible:focus-ring",
        className,
      )}
      {...props}
    />
  );
}

/** Collection of navigation links. Renders `<nav>` with a list; give it an `aria-label`. */
export function CollectionNav({ className, children, ...props }: React.ComponentProps<"nav">): React.JSX.Element {
  return (
    <nav data-slot="collection-nav" className={cn("block", className)} {...props}>
      <ul data-slot="collection" className={collectionBase}>
        {children}
      </ul>
    </nav>
  );
}

export interface CollectionLinkProps extends React.ComponentProps<"a"> {
  /** The current page or section. Sets `aria-current` and the active (secondary) background. */
  active?: boolean;
  /** Render the child element (e.g. Next.js `Link`) instead of an `<a>`. */
  asChild?: boolean;
}

/** A link row inside `CollectionNav` (Materialize `a.collection-item`). */
export function CollectionLink({
  className,
  active = false,
  asChild = false,
  ...props
}: CollectionLinkProps): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "a";
  return (
    <li data-slot="collection-item" className={cn(itemBase, "group/collection-item p-0")} data-active={active ? "" : undefined}>
      <Comp
        data-slot="collection-link"
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-x-4 px-5 py-2.5 no-underline outline-none transition-colors duration-250 focus-visible:focus-ring focus-visible:outline-offset-[-2px]!",
          active ? "bg-secondary text-secondary-foreground" : "text-secondary hover:bg-surface-hover",
          className,
        )}
        {...props}
      />
    </li>
  );
}
