import { Collapsible, CollapsibleBody, CollapsibleHeader, CollapsibleItem } from "@/components/ui/collapsible";
import { MaterialIcon } from "@/components/ui/icons";

export function CollapsiblePopout() {
  return (
    <Collapsible variant="popout" defaultValue="inbox" className="w-full max-w-2xl">
      <CollapsibleItem value="inbox">
        <CollapsibleHeader icon={<MaterialIcon name="inbox" />}>Inbox</CollapsibleHeader>
        <CollapsibleBody>You have 4 unread messages.</CollapsibleBody>
      </CollapsibleItem>
      <CollapsibleItem value="starred">
        <CollapsibleHeader icon={<MaterialIcon name="star" />}>Starred</CollapsibleHeader>
        <CollapsibleBody>Messages you starred appear here.</CollapsibleBody>
      </CollapsibleItem>
      <CollapsibleItem value="sent">
        <CollapsibleHeader icon={<MaterialIcon name="send" />}>Sent</CollapsibleHeader>
        <CollapsibleBody>Everything you sent this week.</CollapsibleBody>
      </CollapsibleItem>
    </Collapsible>
  );
}
