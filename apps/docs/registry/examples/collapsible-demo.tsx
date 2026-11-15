import { Collapsible, CollapsibleBody, CollapsibleHeader, CollapsibleItem } from "@/components/ui/collapsible";
import { MaterialIcon } from "@/components/ui/icons";

export function CollapsibleDemo() {
  return (
    <Collapsible defaultValue="first" className="w-full max-w-2xl">
      <CollapsibleItem value="first">
        <CollapsibleHeader icon={<MaterialIcon name="filter_drama" />}>First</CollapsibleHeader>
        <CollapsibleBody>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</CollapsibleBody>
      </CollapsibleItem>
      <CollapsibleItem value="second">
        <CollapsibleHeader icon={<MaterialIcon name="place" />}>Second</CollapsibleHeader>
        <CollapsibleBody>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</CollapsibleBody>
      </CollapsibleItem>
      <CollapsibleItem value="third">
        <CollapsibleHeader icon={<MaterialIcon name="whatshot" />}>Third</CollapsibleHeader>
        <CollapsibleBody>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</CollapsibleBody>
      </CollapsibleItem>
    </Collapsible>
  );
}
