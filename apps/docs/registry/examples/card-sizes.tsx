import { Card, CardAction, CardContent, CardImage, CardTitle } from "@/components/ui/card";

const sizes = [
  { size: "sm", label: "Small", image: "desert" },
  { size: "md", label: "Medium", image: "dawn" },
  { size: "lg", label: "Large", image: "night" },
] as const;

export function CardSizes() {
  return (
    <div className="grid w-full items-start gap-6 md:grid-cols-3">
      {sizes.map(({ size, label, image }) => (
        <Card key={size} size={size}>
          <CardImage>
            <img src={`/images/landscapes/${image}.svg`} alt="" width={1200} height={800} />
            <CardTitle>{label}</CardTitle>
          </CardImage>
          <CardContent>
            <p>
              Fixed-height card. The image takes up to 60% of the height and the action bar stays at the bottom, so
              cards in a row line up.
            </p>
          </CardContent>
          <CardAction>
            <a href="#">Open</a>
          </CardAction>
        </Card>
      ))}
    </div>
  );
}
