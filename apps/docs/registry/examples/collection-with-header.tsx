import { Collection, CollectionHeader, CollectionItem, CollectionSecondary } from "@/components/ui/collection";
import { MaterialIcon } from "@/components/ui/icons";

export function CollectionWithHeader() {
  return (
    <Collection aria-labelledby="first-names" className="w-full max-w-md">
      <CollectionHeader>
        <h4 id="first-names">First Names</h4>
      </CollectionHeader>
      {["Alvin", "Brenda", "Carlos", "Dana"].map((name) => (
        <CollectionItem key={name}>
          {name}
          <CollectionSecondary>
            <a href="#" aria-label={`Send ${name} a message`}>
              <MaterialIcon name="send" />
            </a>
          </CollectionSecondary>
        </CollectionItem>
      ))}
    </Collection>
  );
}
