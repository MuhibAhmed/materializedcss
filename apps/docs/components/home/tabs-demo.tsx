import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PANELS = [
  {
    value: "overview",
    label: "Overview",
    text: "The indicator is measured with a ResizeObserver, so it stays under the active tab when fonts load or the card resizes.",
  },
  {
    value: "keyboard",
    label: "Keyboard",
    text: "Arrow keys move between tabs, Home and End jump to the ends, and the panel is linked to its tab for screen readers.",
  },
  {
    value: "rtl",
    label: "RTL",
    text: "Pass dir=\"rtl\" and the tabs, indicator and arrow keys all flip direction.",
  },
] as const;

/** Radix tabs with Materialize's sliding indicator. */
export function TabsDemo(): React.JSX.Element {
  return (
    <Card className="overflow-hidden">
      <Tabs defaultValue="overview">
        <TabsList aria-label="Tabs features" fixedWidth>
          {PANELS.map((panel) => (
            <TabsTrigger key={panel.value} value={panel.value}>
              {panel.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {PANELS.map((panel) => (
          <TabsContent key={panel.value} value={panel.value} className="min-h-28 p-6 text-sm leading-relaxed text-muted-foreground">
            {panel.text}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
