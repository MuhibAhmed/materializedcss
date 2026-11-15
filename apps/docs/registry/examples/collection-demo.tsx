import { Collection, CollectionItem } from "@/components/ui/collection";

export function CollectionDemo() {
  return (
    <Collection aria-label="Names" className="w-full max-w-md">
      <CollectionItem>Alvin</CollectionItem>
      <CollectionItem>Alvin</CollectionItem>
      <CollectionItem active>Alvin</CollectionItem>
      <CollectionItem>Alvin</CollectionItem>
    </Collection>
  );
}
