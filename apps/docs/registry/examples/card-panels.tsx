import { CardPanel } from "@/components/ui/card";

export function CardPanels() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <CardPanel className="bg-secondary text-secondary-foreground">
        I am a very simple card. I am good at containing small bits of information.
      </CardPanel>
      <CardPanel className="hoverable">Hover me: hoverable panels and cards lift up on hover.</CardPanel>
    </div>
  );
}
