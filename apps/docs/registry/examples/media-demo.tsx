import { ResponsiveImage } from "@/components/ui/media";

export function MediaDemo() {
  return (
    <ResponsiveImage
      src="/images/landscapes/dawn.svg"
      alt="Pastel sunrise over rolling hills"
      width={1200}
      height={800}
      className="rounded-ui shadow-z1"
    />
  );
}
