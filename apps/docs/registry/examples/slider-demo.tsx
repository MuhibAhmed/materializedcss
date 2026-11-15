import { Slider, SliderCaption, SliderItem } from "@/components/ui/slider";

const slides = [
  { scene: "dawn", align: "center", title: "This is our big Tagline!" },
  { scene: "forest", align: "left", title: "Left Aligned Caption" },
  { scene: "ocean", align: "right", title: "Right Aligned Caption" },
  { scene: "alpine", align: "center", title: "This is our big Tagline!" },
] as const;

export function SliderDemo() {
  return (
    <Slider aria-label="Featured destinations" className="max-w-4xl">
      {slides.map((slide) => (
        <SliderItem key={slide.scene}>
          <img src={`/images/landscapes/${slide.scene}.svg`} alt="" />
          <SliderCaption align={slide.align}>
            <h3 className="text-[2.92rem] font-light leading-tight">{slide.title}</h3>
            <div className="mt-2 text-xl font-light text-md-grey-100">Here&apos;s our small slogan.</div>
          </SliderCaption>
        </SliderItem>
      ))}
    </Slider>
  );
}
