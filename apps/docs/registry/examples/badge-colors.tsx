import { Badge } from "@/components/ui/badge";

export function BadgeColors() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Badge variant="new">3</Badge>
      <Badge variant="new" color="primary">
        12
      </Badge>
      <Badge variant="new" color="success" caption="done">
        5
      </Badge>
      <Badge variant="new" color="error" caption="failed">
        2
      </Badge>
      <Badge variant="new" caption={null}>
        Beta
      </Badge>
      <Badge>99+</Badge>
    </div>
  );
}
