import { Preloader } from "@/components/ui/preloader";

export function PreloaderSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <Preloader size="lg" label="Loading (large)" />
      <Preloader size="md" label="Loading (medium)" />
      <Preloader size="sm" label="Loading (small)" />
    </div>
  );
}
