import { Collapsible, CollapsibleBody, CollapsibleHeader, CollapsibleItem } from "@/components/ui/collapsible";

export function CollapsibleExpandable() {
  return (
    <Collapsible type="multiple" defaultValue={["shipping"]} className="w-full max-w-2xl">
      <CollapsibleItem value="shipping">
        <CollapsibleHeader>Shipping</CollapsibleHeader>
        <CollapsibleBody>Orders ship within two business days.</CollapsibleBody>
      </CollapsibleItem>
      <CollapsibleItem value="returns">
        <CollapsibleHeader>Returns</CollapsibleHeader>
        <CollapsibleBody>Return any item within 30 days for a full refund.</CollapsibleBody>
      </CollapsibleItem>
      <CollapsibleItem value="warranty">
        <CollapsibleHeader>Warranty</CollapsibleHeader>
        <CollapsibleBody>Every product carries a two-year warranty.</CollapsibleBody>
      </CollapsibleItem>
    </Collapsible>
  );
}
