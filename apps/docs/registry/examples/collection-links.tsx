import { CollectionLink, CollectionNav } from "@/components/ui/collection";

export function CollectionLinks() {
  return (
    <CollectionNav aria-label="Account" className="w-full max-w-md">
      <CollectionLink href="#profile">Profile</CollectionLink>
      <CollectionLink href="#settings" active>
        Settings
      </CollectionLink>
      <CollectionLink href="#billing">Billing</CollectionLink>
      <CollectionLink href="#security">Security</CollectionLink>
    </CollectionNav>
  );
}
