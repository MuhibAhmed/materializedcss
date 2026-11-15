import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardImage, CardTitle } from "@/components/ui/card";
import { MaterialIcon } from "@/components/ui/icons";

export function CardWithImage() {
  return (
    <Card className="w-full max-w-sm">
      <CardImage>
        <img src="/images/landscapes/ocean.svg" alt="Sun over a calm ocean" width={1200} height={800} />
        <CardTitle>Card Title</CardTitle>
        <Button variant="floating" color="primary" aria-label="Add to favorites" className="absolute right-6 -bottom-5">
          <MaterialIcon name="add" />
        </Button>
      </CardImage>
      <CardContent>
        <p>
          I am a very simple card. I am good at containing small bits of information. I am convenient because I require
          little markup to use effectively.
        </p>
      </CardContent>
      <CardAction>
        <a href="#">This is a link</a>
      </CardAction>
    </Card>
  );
}
