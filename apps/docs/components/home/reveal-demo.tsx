import Link from "next/link";

import { CardAction, CardContent, CardImage, CardTitle } from "@/components/ui/card";
import { CardReveal, CardRevealRoot, CardRevealTrigger } from "@/components/ui/card-reveal";
import { MoreVertIcon } from "@/components/ui/icons";

/** Image card with a panel that slides up over it (Materialize `.card-reveal`). */
export function RevealDemo(): React.JSX.Element {
  return (
    <CardRevealRoot hoverable>
      <CardImage>
        <img src="/images/landscapes/alpine.svg" alt="Snowy alpine peaks at sunrise" width={1200} height={800} className="aspect-[16/9] object-cover" />
      </CardImage>
      <CardContent className="pb-4">
        <CardTitle>
          <CardRevealTrigger aria-label="Alpine lodge, show details">
            Alpine lodge
            <MoreVertIcon className="size-6 text-muted-foreground" />
          </CardRevealTrigger>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Three nights above the clouds, from $420.</p>
      </CardContent>
      <CardAction>
        <Link href="/docs/components/card">Card docs</Link>
      </CardAction>
      <CardReveal title="Alpine lodge">
        <p className="text-sm leading-relaxed text-muted-foreground">
          The trigger is a real button now, so you can reach it with the keyboard. Escape closes this panel and focus goes back to the title.
        </p>
      </CardReveal>
    </CardRevealRoot>
  );
}
