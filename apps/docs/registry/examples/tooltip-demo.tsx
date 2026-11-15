import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

export function TooltipDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Tooltip content="I am a tooltip" side="bottom">
        <Button>Bottom</Button>
      </Tooltip>
      <Tooltip content="I am a tooltip" side="top">
        <Button>Top</Button>
      </Tooltip>
      <Tooltip content="I am a tooltip" side="left">
        <Button>Left</Button>
      </Tooltip>
      <Tooltip content="I am a tooltip" side="right">
        <Button>Right</Button>
      </Tooltip>
    </div>
  );
}
