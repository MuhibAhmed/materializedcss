import { Button } from "@/components/ui/button";
import { Parallax } from "@/components/ui/parallax";

export function ParallaxContent() {
  return (
    <Parallax src="/images/landscapes/night.svg" height={400} speed={0.6} className="w-full">
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-black/30 px-6 text-center text-white">
        <h3 className="text-h3 font-light">Explore the night sky</h3>
        <div className="max-w-md text-lg font-light">Guided stargazing tours, every clear evening.</div>
        <Button color="primary" size="lg">
          Book a tour
        </Button>
      </div>
    </Parallax>
  );
}
