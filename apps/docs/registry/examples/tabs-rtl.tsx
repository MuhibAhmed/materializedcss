import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsRtl() {
  return (
    <Tabs dir="rtl" defaultValue="home" className="max-w-2xl bg-surface shadow-z1">
      <TabsList aria-label="أقسام">
        <TabsTrigger value="home">الرئيسية</TabsTrigger>
        <TabsTrigger value="news">الأخبار</TabsTrigger>
        <TabsTrigger value="settings">الإعدادات</TabsTrigger>
      </TabsList>
      <TabsContent value="home" lang="ar" className="p-6">
        مرحبا بك في الصفحة الرئيسية.
      </TabsContent>
      <TabsContent value="news" lang="ar" className="p-6">
        آخر الأخبار.
      </TabsContent>
      <TabsContent value="settings" lang="ar" className="p-6">
        إعدادات الحساب.
      </TabsContent>
    </Tabs>
  );
}
