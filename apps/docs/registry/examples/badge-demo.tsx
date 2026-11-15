import { Badge } from "@/components/ui/badge";
import { Collection, CollectionItem } from "@/components/ui/collection";

export function BadgeDemo() {
  return (
    <Collection className="w-full max-w-md">
      <CollectionItem>
        Alan
        <Badge className="ml-auto">1</Badge>
      </CollectionItem>
      <CollectionItem>
        Alan
        <Badge variant="new" className="ml-auto">
          4
        </Badge>
      </CollectionItem>
      <CollectionItem>
        Alan
        <Badge variant="new" caption="custom caption" className="ml-auto">
          4
        </Badge>
      </CollectionItem>
      <CollectionItem>
        Alan
        <Badge caption="custom caption" className="ml-auto">
          4
        </Badge>
      </CollectionItem>
    </Collection>
  );
}
