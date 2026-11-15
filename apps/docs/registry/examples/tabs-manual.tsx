"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsManual() {
  const [value, setValue] = React.useState("overview");

  return (
    <div className="w-full max-w-2xl space-y-3">
      <Tabs value={value} onValueChange={setValue} activationMode="manual" className="bg-surface shadow-z1">
        <TabsList aria-label="Project">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="p-6">
          Project overview.
        </TabsContent>
        <TabsContent value="activity" className="p-6">
          Recent activity.
        </TabsContent>
        <TabsContent value="settings" className="p-6">
          Project settings.
        </TabsContent>
      </Tabs>
      <p className="text-sm text-muted-foreground">
        Selected: <strong>{value}</strong>. Arrow keys move focus; Enter or Space activates.
      </p>
    </div>
  );
}
