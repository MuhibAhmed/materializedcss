import { Fab, FabAction, FabActions, FabTrigger } from "@/components/ui/fab";
import { MaterialIcon } from "@/components/ui/icons";

export function FabToolbar() {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-ui border border-border">
      <p className="p-4 text-muted-foreground">Tap the button to turn it into a toolbar.</p>
      <Fab toolbar position="static">
        <FabTrigger aria-label="Open toolbar">
          <MaterialIcon name="menu" />
        </FabTrigger>
        <FabActions>
          <FabAction label="Insert chart">
            <MaterialIcon name="insert_chart" />
          </FabAction>
          <FabAction label="Add quote">
            <MaterialIcon name="format_quote" />
          </FabAction>
          <FabAction label="Publish">
            <MaterialIcon name="publish" />
          </FabAction>
          <FabAction label="Attach file">
            <MaterialIcon name="attach_file" />
          </FabAction>
        </FabActions>
      </Fab>
    </div>
  );
}
