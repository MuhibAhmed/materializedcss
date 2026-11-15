import { Button } from "@/components/ui/button";
import { Carousel, CarouselItem } from "@/components/ui/carousel";

const slides = [
  { title: "First panel", color: "bg-md-red-700", href: "#first-panel" },
  { title: "Second panel", color: "bg-md-deep-orange-900", href: "#second-panel" },
  { title: "Third panel", color: "bg-md-green-800", href: "#third-panel" },
  { title: "Fourth panel", color: "bg-md-blue-800", href: "#fourth-panel" },
];

export function CarouselFullWidth() {
  return (
    <Carousel
      fullWidth
      indicators
      aria-label="Highlights"
      height={360}
      className="max-w-3xl shadow-z1"
      fixedContent={
        <Button variant="outlined" className="border-white/70 text-white">
          Get started
        </Button>
      }
    >
      {slides.map((slide) => (
        <CarouselItem key={slide.title} className={`${slide.color} p-8 text-white`}>
          <h3 className="text-2xl font-medium">{slide.title}</h3>
          <div className="mt-2 max-w-md text-[15px]">
            This is your {slide.title.toLowerCase()}. Drag, swipe or use the arrows to move between panels.
          </div>
          <Button asChild variant="flat" className="-ml-4 mt-4 text-white">
            <a href={slide.href}>Read more</a>
          </Button>
        </CarouselItem>
      ))}
    </Carousel>
  );
}
