import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsDemo() {
  return (
    <Tabs defaultValue="test2" className="max-w-2xl bg-surface shadow-z1">
      <TabsList aria-label="Demo tabs">
        <TabsTrigger value="test1">Test 1</TabsTrigger>
        <TabsTrigger value="test2">Test 2</TabsTrigger>
        <TabsTrigger value="test3" disabled>
          Disabled Tab
        </TabsTrigger>
        <TabsTrigger value="test4">Test 4</TabsTrigger>
      </TabsList>
      <TabsContent value="test1" className="p-6">
        Test 1
      </TabsContent>
      <TabsContent value="test2" className="p-6">
        Test 2
      </TabsContent>
      <TabsContent value="test3" className="p-6">
        Test 3
      </TabsContent>
      <TabsContent value="test4" className="p-6">
        Test 4
      </TabsContent>
    </Tabs>
  );
}
