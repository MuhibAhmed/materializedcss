import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsFixedWidth() {
  return (
    <Tabs defaultValue="music" className="max-w-2xl bg-surface shadow-z1">
      <TabsList fixedWidth aria-label="Media">
        <TabsTrigger value="music">Music</TabsTrigger>
        <TabsTrigger value="videos">Videos</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
      </TabsList>
      <TabsContent value="music" className="p-6">
        Your playlists and saved albums.
      </TabsContent>
      <TabsContent value="videos" className="p-6">
        Clips you recorded or saved.
      </TabsContent>
      <TabsContent value="photos" className="p-6">
        Every photo, sorted by date.
      </TabsContent>
    </Tabs>
  );
}
