import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function TabsScrollable() {
  return (
    <Tabs defaultValue="October" className="max-w-md bg-surface shadow-z1">
      <TabsList aria-label="Months">
        {months.map((month) => (
          <TabsTrigger key={month} value={month}>
            {month}
          </TabsTrigger>
        ))}
      </TabsList>
      {months.map((month) => (
        <TabsContent key={month} value={month} className="p-6">
          Events in {month}.
        </TabsContent>
      ))}
    </Tabs>
  );
}
