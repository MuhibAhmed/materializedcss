import { Carousel, CarouselItem } from "@/components/ui/carousel";

const scenes = ["alpine", "ocean", "dawn", "forest", "desert"];

export function CarouselAutoplay() {
  return (
    <Carousel fullWidth indicators autoplay={3000} aria-label="Destinations" height={320} className="max-w-3xl shadow-z1">
      {scenes.map((scene) => (
        <CarouselItem key={scene}>
          <img src={`/images/landscapes/${scene}.svg`} alt={`${scene} landscape`} className="size-full object-cover" />
        </CarouselItem>
      ))}
    </Carousel>
  );
}
