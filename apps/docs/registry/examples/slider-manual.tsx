"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Slider, SliderCaption, SliderItem } from "@/components/ui/slider";

const scenes = ["night", "desert", "forest"];

export function SliderManual() {
  const [index, setIndex] = React.useState(0);

  return (
    <div className="w-full max-w-3xl space-y-2">
      <Slider autoplay={false} height={300} activeIndex={index} onIndexChange={setIndex} aria-label="Gallery">
        {scenes.map((scene) => (
          <SliderItem key={scene}>
            <img src={`/images/landscapes/${scene}.svg`} alt={`${scene} landscape`} />
            <SliderCaption align="left">
              <div className="text-3xl font-light capitalize">{scene}</div>
            </SliderCaption>
          </SliderItem>
        ))}
      </Slider>
      <div className="flex justify-center gap-2">
        <Button variant="flat" onClick={() => setIndex((i) => (i + scenes.length - 1) % scenes.length)}>
          Previous
        </Button>
        <Button variant="flat" onClick={() => setIndex((i) => (i + 1) % scenes.length)}>
          Next
        </Button>
      </div>
    </div>
  );
}
