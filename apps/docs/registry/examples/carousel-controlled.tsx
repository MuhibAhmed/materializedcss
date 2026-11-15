"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselItem, type CarouselHandle } from "@/components/ui/carousel";

const colors = ["bg-md-indigo-600", "bg-md-teal-700", "bg-md-deep-orange-700", "bg-md-purple-700", "bg-md-blue-grey-700"];

export function CarouselControlled() {
  const carousel = React.useRef<CarouselHandle>(null);
  const [index, setIndex] = React.useState(0);

  return (
    <div className="w-full max-w-3xl space-y-4">
      <Carousel
        ref={carousel}
        noWrap
        controls={false}
        activeIndex={index}
        onIndexChange={setIndex}
        aria-label="Cards"
        height={300}
      >
        {colors.map((color, i) => (
          <CarouselItem key={color} className={`${color} flex items-center justify-center text-4xl font-light text-white`}>
            {i + 1}
          </CarouselItem>
        ))}
      </Carousel>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="flat" onClick={() => carousel.current?.prev()}>
          Prev
        </Button>
        <Button variant="flat" onClick={() => setIndex(0)}>
          First
        </Button>
        <Button variant="flat" onClick={() => carousel.current?.next()}>
          Next
        </Button>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          Slide {index + 1} of {colors.length}
        </span>
      </div>
    </div>
  );
}
