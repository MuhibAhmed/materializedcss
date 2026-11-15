import { Card, CardAction, CardContent, CardTitle } from "@/components/ui/card";

export function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardContent>
        <CardTitle>Card Title</CardTitle>
        <p>
          I am a very simple card. I am good at containing small bits of information. I am convenient because I require
          little markup to use effectively.
        </p>
      </CardContent>
      <CardAction>
        <a href="#">This is a link</a>
        <a href="#">This is a link</a>
      </CardAction>
    </Card>
  );
}
