import { CardAction, CardContent, CardImage, CardTitle } from "@/components/ui/card";
import { CardReveal, CardRevealRoot, CardRevealTrigger } from "@/components/ui/card-reveal";
import { MoreVertIcon } from "@/components/ui/icons";

export function CardRevealDemo() {
  return (
    <CardRevealRoot className="w-full max-w-sm">
      <CardImage>
        <img src="/images/landscapes/alpine.svg" alt="Snowy alpine peaks" width={1200} height={800} />
      </CardImage>
      <CardContent>
        <CardTitle>
          <CardRevealTrigger>
            Card Title
            <MoreVertIcon className="size-6" />
          </CardRevealTrigger>
        </CardTitle>
        <p>
          <a href="#" className="text-link">
            This is a link
          </a>
        </p>
      </CardContent>
      <CardAction>
        <a href="#">Share</a>
      </CardAction>
      <CardReveal title="Card Title">
        <p>Here is some more information about this product that is only revealed once clicked on.</p>
      </CardReveal>
    </CardRevealRoot>
  );
}
