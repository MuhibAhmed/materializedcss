import { Preloader } from "@/components/ui/preloader";

export function PreloaderColors() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <Preloader color="primary" label="Loading messages" />
      <Preloader color="success" label="Saving" />
      <Preloader color="var(--color-md-indigo-500)" label="Syncing" />
      <Preloader multicolor label="Loading photos" />
    </div>
  );
}
