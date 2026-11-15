import { Materialbox } from "@/components/ui/materialbox";

export function MaterialboxCaption() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <Materialbox
        src="/images/landscapes/alpine.svg"
        alt="Snowy alpine peaks"
        caption="Alpine peaks above the tree line, early morning."
        width={1200}
        height={800}
        className="w-[250px]"
      />
      <Materialbox
        src="/images/landscapes/ocean.svg"
        alt="Calm ocean at midday"
        caption="A calm sea, an hour before the tide turns."
        width={1200}
        height={800}
        className="w-[250px]"
      />
    </div>
  );
}
