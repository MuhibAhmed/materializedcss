import { Materialbox } from "@/components/ui/materialbox";

export function MaterialboxDemo() {
  return (
    <Materialbox
      src="/images/landscapes/forest.svg"
      alt="Pine forest under a pale green sky"
      width={1200}
      height={800}
      className="w-[350px]"
    />
  );
}
