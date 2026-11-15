import { Fab, FabAction, FabActions, FabTrigger } from "@/components/ui/fab";
import { AddIcon, MaterialIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const directions = [
  { direction: "top", cell: "items-end justify-center" },
  { direction: "bottom", cell: "items-start justify-center" },
  { direction: "left", cell: "items-center justify-end" },
  { direction: "right", cell: "items-center justify-start" },
] as const;

export function FabDirections() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
      {directions.map(({ direction, cell }) => (
        <div key={direction} className={cn("flex h-60 rounded-ui border border-dashed border-border p-4", cell)}>
          <Fab position="static" direction={direction} hoverEnabled={false} color="secondary">
            <FabTrigger aria-label={`Actions (opens ${direction})`}>
              <AddIcon />
            </FabTrigger>
            <FabActions>
              <FabAction label="Share" color="primary">
                <MaterialIcon name="share" />
              </FabAction>
              <FabAction label="Favorite" color="error">
                <MaterialIcon name="favorite" />
              </FabAction>
              <FabAction label="Download" color="success">
                <MaterialIcon name="download" />
              </FabAction>
            </FabActions>
          </Fab>
        </div>
      ))}
    </div>
  );
}
