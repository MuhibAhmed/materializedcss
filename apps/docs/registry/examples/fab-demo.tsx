import { Fab, FabAction, FabActions, FabTrigger } from "@/components/ui/fab";
import { MaterialIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/tooltip";

const actions = [
  { label: "Insert chart", icon: "insert_chart", color: "primary" },
  { label: "Add quote", icon: "format_quote", color: "secondary" },
  { label: "Publish", icon: "publish", color: "success" },
  { label: "Attach file", icon: "attach_file", color: "error" },
] as const;

export function FabDemo() {
  return (
    <div className="flex min-h-[320px] w-full items-end justify-center">
      <Fab position="static">
        <FabTrigger aria-label="Edit options">
          <MaterialIcon name="mode_edit" />
        </FabTrigger>
        <FabActions>
          {actions.map((action) => (
            <Tooltip key={action.label} content={action.label} side="left">
              <FabAction label={action.label} color={action.color}>
                <MaterialIcon name={action.icon} />
              </FabAction>
            </Tooltip>
          ))}
        </FabActions>
      </Fab>
    </div>
  );
}
