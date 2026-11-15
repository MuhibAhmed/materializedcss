import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsTransparent() {
  return (
    <Tabs defaultValue="flights" className="max-w-2xl bg-surface shadow-z1">
      <div className="bg-md-indigo-800 text-white">
        <div className="px-6 pb-2 pt-5 text-2xl font-light">Travel</div>
        <TabsList transparent fixedWidth aria-label="Travel">
          <TabsTrigger value="flights">Flights</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="cars">Cars</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="flights" className="p-6">
        Search flights to anywhere.
      </TabsContent>
      <TabsContent value="hotels" className="p-6">
        Find a place to stay.
      </TabsContent>
      <TabsContent value="cars" className="p-6">
        Rent a car at your destination.
      </TabsContent>
    </Tabs>
  );
}
