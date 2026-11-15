"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsHidden() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="w-full max-w-2xl space-y-4">
      <Button aria-expanded={open} aria-controls="product-details" onClick={() => setOpen((value) => !value)}>
        {open ? "Hide details" : "Show details"}
      </Button>
      {/* Rendered while hidden: the indicator is measured once the panel becomes visible. */}
      <div id="product-details" hidden={!open}>
        <Tabs defaultValue="specs" className="bg-surface shadow-z1">
          <TabsList aria-label="Details">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="p-6">
            A lightweight jacket for every season.
          </TabsContent>
          <TabsContent value="specs" className="p-6">
            100% recycled nylon, 320 g.
          </TabsContent>
          <TabsContent value="reviews" className="p-6">
            4.8 out of 5 stars.
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
