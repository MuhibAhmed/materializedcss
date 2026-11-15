import { Card, CardAction, CardContent, CardImage, CardStacked } from "@/components/ui/card";

export function CardHorizontal() {
  return (
    <Card orientation="horizontal" className="w-full max-w-xl">
      <CardImage>
        <img src="/images/landscapes/forest.svg" alt="Green hills under a pale sky" width={1200} height={800} />
      </CardImage>
      <CardStacked>
        <CardContent>
          <p>I am a very simple card. I am good at containing small bits of information.</p>
        </CardContent>
        <CardAction>
          <a href="#">This is a link</a>
        </CardAction>
      </CardStacked>
    </Card>
  );
}
