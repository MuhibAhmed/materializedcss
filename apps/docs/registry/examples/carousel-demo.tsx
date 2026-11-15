import { Carousel, CarouselItem } from "@/components/ui/carousel";

const scenes = ["dawn", "forest", "ocean", "desert", "night", "alpine"];

export function CarouselDemo() {
  return (
    <Carousel aria-label="Landscapes" className="max-w-3xl">
      {scenes.map((scene) => (
        <CarouselItem key={scene}>
          <a href={`#${scene}`} aria-label={`${scene} landscape`}>
            <img src={`/images/landscapes/${scene}.svg`} alt="" className="size-full object-cover" />
          </a>
        </CarouselItem>
      ))}
    </Carousel>
  );
}
