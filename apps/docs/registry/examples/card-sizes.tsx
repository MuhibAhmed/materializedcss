import { Card, CardAction, CardContent, CardImage, CardTitle } from "@/components/ui/card";

const sizes = [
  { size: "sm", label: "Small", image: "desert", text: "300px tall. Keep it short." },
  {
    size: "md",
    label: "Medium",
    image: "dawn",
    text: "400px tall. The image takes up to 60% of the height and the action bar stays at the bottom.",
  },
  {
    size: "lg",
    label: "Large",
    image: "night",
    text: "500px tall. Every size pins the action bar to the bottom, so cards of the same size line up in a row.",
  },
] as const;

export function CardSizes() {
  return (
    <div className="grid w-full items-start gap-6 md:grid-cols-3">
      {sizes.map(({ size, label, image, text }) => (
        <Card key={size} size={size}>
          <CardImage>
            <img src={`/images/landscapes/${image}.svg`} alt="" width={1200} height={800} />
            <CardTitle>{label}</CardTitle>
          </CardImage>
          <CardContent>
            <p>{text}</p>
          </CardContent>
          <CardAction>
            <a href="#">Open</a>
          </CardAction>
        </Card>
      ))}
    </div>
  );
}
