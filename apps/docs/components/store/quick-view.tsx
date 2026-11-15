"use client";

import * as React from "react";

import { type ArtView, productImage } from "~/components/store/art";
import { type Product, type ProductColor, categoryLabel, discountPercent, getProduct } from "~/components/store/data";
import { Price, Rating, Swatch } from "~/components/store/shared";
import { MAX_QTY, useStore } from "~/components/store/store-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Chip } from "@/components/ui/chip";
import { AddIcon, CloseIcon, MaterialIcon, RemoveIcon } from "@/components/ui/icons";
import { Modal, ModalClose, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";

const VIEWS: Array<{ view: ArtView; label: string }> = [
  { view: "front", label: "Front view" },
  { view: "detail", label: "Detail" },
  { view: "flat", label: "Flat lay" },
];

/** Product details in a modal: image carousel, color and size choice, quantity and add to cart. */
export function QuickView(): React.JSX.Element {
  const { quickViewId, setQuickViewId } = useStore();
  const product = quickViewId ? getProduct(quickViewId) : undefined;
  // Keep the last product while the close animation runs.
  const [shown, setShown] = React.useState<Product | undefined>(product);
  if (product && product !== shown) setShown(product);

  return (
    <Modal open={Boolean(product)} onOpenChange={(open) => !open && setQuickViewId(null)}>
      <ModalContent
        data-testid="quick-view"
        className="top-[5%] max-h-[90%] w-[94%] sm:w-[88%] md:top-[8%] md:max-h-[84%] lg:w-[min(960px,80%)]"
      >
        {shown ? <QuickViewBody key={shown.id} product={shown} onDone={() => setQuickViewId(null)} /> : null}
      </ModalContent>
    </Modal>
  );
}

function QuickViewBody({ product, onDone }: { product: Product; onDone: () => void }): React.JSX.Element {
  const { addItem } = useStore();
  const [color, setColor] = React.useState<ProductColor | undefined>(product.colors[0]);
  const firstSize = product.sizes.find((size) => !product.soldOutSizes?.includes(size)) ?? null;
  const [size, setSize] = React.useState<string | null>(firstSize);
  const [qty, setQty] = React.useState(1);
  const off = discountPercent(product);
  const hex = color?.hex ?? "#9e9e9e";

  return (
    <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="relative bg-md-grey-100 [--qv-h:clamp(240px,60vw,420px)] dark:bg-md-grey-900 md:min-h-[420px] md:rounded-l-ui md:[--qv-h:100%]">
        <Carousel
          key={hex}
          fullWidth
          indicators
          aria-label={`${product.name} photos`}
          height="var(--qv-h)"
          className="md:absolute md:inset-0"
        >
          {VIEWS.map(({ view, label }) => (
            <CarouselItem key={view}>
              <img
                src={productImage(product.kind, hex, view)}
                alt={`${product.name} in ${color?.name ?? "default"}, ${label.toLowerCase()}`}
                className="size-full object-cover"
                draggable={false}
              />
            </CarouselItem>
          ))}
        </Carousel>
        {off ? (
          <Badge variant="new" color="primary" caption="" className="pointer-events-none absolute left-3 top-3 min-w-0 px-2 shadow-z1">
            -{off}%
          </Badge>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="m-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {product.brand} · {categoryLabel(product.category)}
            </p>
            <ModalTitle className="mt-1 text-[1.75rem] font-light">{product.name}</ModalTitle>
          </div>
          <ModalClose asChild>
            <button
              type="button"
              aria-label="Close quick view"
              className="-mr-2 -mt-1 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:focus-ring [&_svg]:size-6"
            >
              <CloseIcon />
            </button>
          </ModalClose>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Price product={product} className="[&>span:first-child]:text-2xl" />
          <Rating value={product.rating} reviews={product.reviews} />
        </div>

        <ModalDescription className="m-0 text-[15px] leading-relaxed">{product.description}</ModalDescription>

        {product.colors.length > 0 ? (
          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 text-sm text-muted-foreground">
              Color: <span className="text-foreground">{color?.name}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => {
                const on = c.name === color?.name;
                return (
                  <Chip key={c.name} asChild selected={on}>
                    <button type="button" aria-pressed={on} onClick={() => setColor(c)}>
                      <Swatch hex={c.hex} className="-ml-1.5 mr-2 size-5" />
                      {c.name}
                    </button>
                  </Chip>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {product.sizes.length > 0 ? (
          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 text-sm text-muted-foreground">
              Size: <span className="text-foreground">{size ?? "choose one"}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const soldOut = product.soldOutSizes?.includes(s) ?? false;
                const on = s === size;
                return (
                  <Chip key={s} asChild selected={on} disabled={soldOut}>
                    <button
                      type="button"
                      aria-pressed={on}
                      disabled={soldOut}
                      aria-label={soldOut ? `${s}, sold out` : s}
                      onClick={() => setSize(s)}
                      className={soldOut ? "line-through" : undefined}
                    >
                      {s}
                    </button>
                  </Chip>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2" role="group" aria-label="Quantity">
            <Button
              variant="floating"
              size="sm"
              color="default"
              aria-label="Decrease quantity"
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <RemoveIcon />
            </Button>
            <output aria-live="polite" aria-label="Quantity" className="w-8 text-center text-lg tabular-nums">
              {qty}
            </output>
            <Button
              variant="floating"
              size="sm"
              color="default"
              aria-label="Increase quantity"
              disabled={qty >= MAX_QTY}
              onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
            >
              <AddIcon />
            </Button>
          </div>
          <Button
            color="primary"
            size="lg"
            className="flex-1"
            disabled={!product.inStock}
            onClick={() => {
              addItem(product, { color, size, qty });
              onDone();
            }}
          >
            <MaterialIcon name="add_shopping_cart" />
            {product.inStock ? "Add to cart" : "Sold out"}
          </Button>
        </div>

        <ul className="m-0 grid list-none gap-2 border-t border-border p-0 pt-4 text-sm text-muted-foreground">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <MaterialIcon name="check_circle" size={18} className="text-secondary" />
              {feature}
            </li>
          ))}
          <li className="flex items-start gap-2">
            <MaterialIcon name="local_shipping" size={18} className="text-secondary" />
            Ships in 1 to 2 business days
          </li>
        </ul>
      </div>
    </div>
  );
}
