import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/icons";
import { TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger } from "@/components/ui/tooltip";

export function TooltipComposable() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-4">
        <TooltipRoot>
          <TooltipTrigger asChild>
            <Button variant="floating" color="secondary" aria-label="Upload">
              <MaterialIcon name="cloud_upload" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Upload files</TooltipContent>
        </TooltipRoot>
        <TooltipRoot exitDelay={500}>
          <TooltipTrigger asChild>
            <Button variant="flat">Keyboard shortcut</Button>
          </TooltipTrigger>
          <TooltipContent className="gap-2">
            Save <kbd className="rounded-sm bg-white/15 px-1.5 font-mono text-sm dark:bg-black/10">Ctrl S</kbd>
          </TooltipContent>
        </TooltipRoot>
      </div>
    </TooltipProvider>
  );
}
