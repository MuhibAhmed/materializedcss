import * as React from "react";

import { type Product, discountPercent, formatPrice } from "~/components/store/data";
import { MaterialIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** Five stars with half steps, plus an optional review count. */
export function Rating({
  value,
  reviews,
  className,
  size = 18,
}: {
  value: number;
  reviews?: number;
  className?: string;
  size?: number;
}): React.JSX.Element {
  const stars = Array.from({ length: 5 }, (_, index) => {
    const fill = value - index;
    return fill >= 0.75 ? "star" : fill >= 0.25 ? "star_half" : "star_border";
  });
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm text-muted-foreground", className)}>
      <span role="img" aria-label={`Rated ${value.toFixed(1)} out of 5`} className="inline-flex text-md-amber-700 dark:text-md-amber-400">
        {stars.map((name, index) => (
          <MaterialIcon key={index} name={name} size={size} />
        ))}
      </span>
      {reviews !== undefined ? <span className="tabular-nums">({reviews.toLocaleString("en-US")})</span> : null}
    </span>
  );
}

/** Current price, and the struck-through original price when on sale. */
export function Price({ product, className }: { product: Product; className?: string }): React.JSX.Element {
  const off = discountPercent(product);
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("text-lg font-medium tabular-nums", off ? "text-primary" : "text-foreground")}>
        {formatPrice(product.price)}
      </span>
      {off && product.compareAt ? (
        <s className="text-sm tabular-nums text-muted-foreground">
          <span className="sr-only">was </span>
          {formatPrice(product.compareAt)}
        </s>
      ) : null}
    </span>
  );
}

/** A round color dot for swatches. */
export function Swatch({ hex, className }: { hex: string; className?: string }): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-4 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]", className)}
      style={{ backgroundColor: hex }}
    />
  );
}
