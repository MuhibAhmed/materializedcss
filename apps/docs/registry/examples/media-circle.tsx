import { CircleImage, ResponsiveImage } from "@/components/ui/media";

export function MediaCircle() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <CircleImage src="/images/avatars/ada.svg" alt="Ada" size={120} />
      <CircleImage src="/images/avatars/linus.svg" alt="Linus" size={80} />
      <CircleImage src="/images/landscapes/forest.svg" alt="Forest (cropped, not squashed)" size={80} />
      <ResponsiveImage src="/images/avatars/grace.svg" alt="Grace" width={160} height={160} circle className="w-40" />
    </div>
  );
}
