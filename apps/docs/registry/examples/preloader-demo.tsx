import { Preloader } from "@/components/ui/preloader";

export function PreloaderDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <Preloader size="lg" multicolor />
      <Preloader />
    </div>
  );
}
