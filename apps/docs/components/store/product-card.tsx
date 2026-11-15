"use client";

import * as React from "react";

import { productImage } from "~/components/store/art";
import { type Product, discountPercent } from "~/components/store/data";
import { Price, Rating, Swatch } from "~/components/store/shared";
import { useStore } from "~/components/store/store-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardAction, CardContent, CardImage, CardTitle } from "@/components/ui/card";
import { CardReveal, CardRevealRoot, CardRevealTrigger } from "@/components/ui/card-reveal";
import { MaterialIcon, MoreVertIcon } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Product tile: a hoverable card with a halfway "add to cart" FAB on the image,
 * sale and new badges, a wishlist toggle and a reveal panel with the details.
 */
export function ProductCard({ product }: { product: Product }): React.JSX.Element {
  const { addItem, setQuickViewId, wishlist, toggleWishlist } = useStore();
  const off = discountPercent(product);
  const saved = wishlist.has(product.id);
  const color = product.colors[0];
  const image = productImage(product.kind, color?.hex ?? "#9e9e9e");

  return (
    <CardRevealRoot hoverable data-product={product.id} className="group/product flex h-full flex-col">
      <CardImage>
        <button
          type="button"
          onClick={() => setQuickViewId(product.id)}
          aria-label={`Quick view: ${product.name}`}
          className="block w-full cursor-zoom-in overflow-hidden rounded-t-ui outline-none focus-visible:focus-ring focus-visible:-outline-offset-2"
        >
          <img
            src={image}
            alt=""
            width={400}
            height={300}
            className={cn(
              "aspect-[4/3] object-cover transition-transform duration-500 ease-out-cubic group-hover/product:scale-105",
              !product.inStock && "opacity-55 grayscale-[0.6]",
            )}
          />
        </button>
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {off ? (
            <Badge variant="new" color="primary" caption="" className="min-w-0 px-2 font-normal shadow-z1">
              <span className="sr-only">On sale, </span>-{off}%
            </Badge>
          ) : null}
          {product.isNew ? (
            <Badge variant="new" color="secondary" caption="" className="min-w-0 px-2 font-normal shadow-z1">
              New
            </Badge>
          ) : null}
          {!product.inStock ? (
            <Badge variant="new" caption="" className="min-w-0 bg-md-grey-800 px-2 font-normal text-white shadow-z1">
              Sold out
            </Badge>
          ) : null}
        </div>
        <Tooltip content={saved ? "Remove from wishlist" : "Save to wishlist"} side="left">
          <button
            type="button"
            aria-label={`Save ${product.name} to wishlist`}
            aria-pressed={saved}
            onClick={() => toggleWishlist(product)}
            className={cn(
              "absolute right-2 top-2 inline-flex size-8 sm:size-9 cursor-pointer items-center justify-center rounded-full bg-surface/90 text-muted-foreground shadow-z1 outline-none transition-colors hover:text-primary focus-visible:focus-ring",
              saved && "text-primary",
            )}
          >
            <MaterialIcon name={saved ? "favorite" : "favorite_border"} size={20} />
          </button>
        </Tooltip>
        <Tooltip content={product.inStock ? "Add to cart" : "Sold out"} side="top">
          <span className="absolute -bottom-5 right-3 z-[2] inline-flex rounded-full sm:right-4">
            <Button
              variant="floating"
              color="primary"
              aria-label={`Add ${product.name} to cart`}
              className="max-sm:size-10 max-sm:[&_.material-icons]:text-xl"
              disabled={!product.inStock}
              onClick={() => addItem(product)}
            >
              <MaterialIcon name="add_shopping_cart" />
            </Button>
          </span>
        </Tooltip>
      </CardImage>
      <CardContent className="flex flex-1 flex-col gap-1 p-3 pt-5 sm:p-4 sm:pt-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{product.brand}</p>
        <CardTitle as="h3" className="mb-0! text-base font-normal leading-6! sm:text-lg">
          <CardRevealTrigger aria-label={`${product.name}, show details`} className="items-start">
            <span className="min-w-0">{product.name}</span>
            <MoreVertIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          </CardRevealTrigger>
        </CardTitle>
        <Rating value={product.rating} reviews={product.reviews} size={16} className="flex-wrap gap-x-1 gap-y-0 text-xs sm:text-sm" />
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <Price product={product} />
          <span className="flex gap-1 max-sm:hidden" aria-label={`${product.colors.length} colors`} role="img">
            {product.colors.map((c) => (
              <Swatch key={c.name} hex={c.hex} className="size-3" />
            ))}
          </span>
        </div>
      </CardContent>
      <CardAction className="px-1 py-1 sm:px-2 sm:py-1.5">
        <Button variant="flat" color="secondary" size="sm" onClick={() => setQuickViewId(product.id)}>
          Quick view
        </Button>
      </CardAction>
      <CardReveal title={product.name} className="p-4 sm:p-5 [&_h3]:text-xl [&_h3]:font-normal">
        <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        <ul className="mt-3 space-y-1.5 text-sm">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <MaterialIcon name="check" size={18} className="text-secondary" />
              {feature}
            </li>
          ))}
        </ul>
        {product.sizes.length > 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Sizes {product.sizes.join(" · ")}</p>
        ) : null}
        <Button
          className="mt-4 w-full"
          color="primary"
          disabled={!product.inStock}
          onClick={() => addItem(product)}
        >
          {product.inStock ? "Add to cart" : "Sold out"}
        </Button>
      </CardReveal>
    </CardRevealRoot>
  );
}
