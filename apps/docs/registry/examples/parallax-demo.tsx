import { Parallax } from "@/components/ui/parallax";

export function ParallaxDemo() {
  return (
    <div className="w-full">
      <Parallax src="/images/landscapes/dawn.svg" height={320} />
      <div className="bg-surface px-6 py-10">
        <h3 className="text-h5 font-light text-foreground">Parallax</h3>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Parallax is an effect where the background content or image moves at a different speed than the foreground
          content while scrolling. Scroll the page to see the images move.
        </p>
      </div>
      <Parallax src="/images/landscapes/alpine.svg" height={320} />
    </div>
  );
}
