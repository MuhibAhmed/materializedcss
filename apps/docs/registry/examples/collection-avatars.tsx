import {
  Collection,
  CollectionAvatar,
  CollectionItem,
  CollectionSecondary,
  CollectionTitle,
} from "@/components/ui/collection";
import { MaterialIcon } from "@/components/ui/icons";

const people = [
  { name: "Ada Lovelace", avatar: "/images/avatars/ada.svg" },
  { name: "Grace Hopper", avatar: "/images/avatars/grace.svg" },
];

export function CollectionAvatars() {
  return (
    <Collection aria-label="Contacts" className="w-full max-w-md">
      {people.map((person) => (
        <CollectionItem key={person.name} avatar>
          <CollectionAvatar asChild>
            <img src={person.avatar} alt="" />
          </CollectionAvatar>
          <CollectionTitle>{person.name}</CollectionTitle>
          <p className="text-muted-foreground">
            First Line <br />
            Second Line
          </p>
          <CollectionSecondary>
            <a href="#" aria-label={`Star ${person.name}`}>
              <MaterialIcon name="grade" />
            </a>
          </CollectionSecondary>
        </CollectionItem>
      ))}
      <CollectionItem avatar>
        <CollectionAvatar className="bg-secondary text-secondary-foreground">
          <MaterialIcon name="folder" />
        </CollectionAvatar>
        <CollectionTitle>Documents</CollectionTitle>
        <p className="text-muted-foreground">12 files</p>
        <CollectionSecondary>
          <a href="#" aria-label="Star Documents">
            <MaterialIcon name="grade" />
          </a>
        </CollectionSecondary>
      </CollectionItem>
    </Collection>
  );
}
