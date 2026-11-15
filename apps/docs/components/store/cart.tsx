"use client";

import * as React from "react";

import { productImage } from "~/components/store/art";
import { FREE_SHIPPING_THRESHOLD, formatMoney, formatPrice } from "~/components/store/data";
import { MAX_QTY, useCartLines, useStore } from "~/components/store/store-context";
import { Button } from "@/components/ui/button";
import { Collection, CollectionAvatar, CollectionHeader, CollectionItem, CollectionTitle } from "@/components/ui/collection";
import { Divider } from "@/components/ui/divider";
import { AddIcon, CloseIcon, MaterialIcon, RemoveIcon } from "@/components/ui/icons";
import { Progress } from "@/components/ui/progress";
import { Sidenav, SidenavClose, SidenavContent } from "@/components/ui/sidenav";

/** Slide-in cart from the right edge: items, free shipping progress and totals. */
export function CartSidenav(): React.JSX.Element {
  const { cartOpen, setCartOpen, setCheckoutOpen, count, subtotal, setQty, removeItem } = useStore();
  const lines = useCartLines();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <Sidenav open={cartOpen} onOpenChange={setCartOpen} edge="right">
      <SidenavContent
        label="Shopping cart"
        data-testid="cart"
        className="w-[400px] max-w-[calc(100vw-40px)] [&>nav]:flex [&>nav]:min-h-full [&>nav]:flex-col [&>nav>ul]:flex [&>nav>ul]:flex-1 [&>nav>ul]:flex-col [&>nav>ul]:pb-0"
      >
        <li className="sticky top-0 z-[2] flex items-center gap-2 bg-primary px-4 py-3 text-primary-foreground shadow-z1 dark:bg-[#2a1f20] dark:text-white">
          <MaterialIcon name="shopping_cart" />
          <h2 className="m-0 flex-1 text-xl font-normal">
            Your cart <span className="text-base opacity-80">({count})</span>
          </h2>
          <SidenavClose asChild>
            <button
              type="button"
              aria-label="Close cart"
              className="-mr-1 inline-flex size-10 cursor-pointer items-center justify-center rounded-full outline-none transition-colors hover:bg-black/10 focus-visible:focus-ring [&_svg]:size-6"
            >
              <CloseIcon />
            </button>
          </SidenavClose>
        </li>

        {lines.length === 0 ? (
          <li className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-16 text-center">
            <span className="inline-flex size-24 items-center justify-center rounded-full bg-surface-hover">
              <MaterialIcon name="remove_shopping_cart" size={44} className="text-muted-foreground" />
            </span>
            <p className="m-0 text-lg">Your cart is empty</p>
            <p className="m-0 text-sm text-muted-foreground">Add something you love and it will show up here.</p>
            <SidenavClose asChild>
              <Button color="primary" className="mt-2">
                Keep shopping
              </Button>
            </SidenavClose>
          </li>
        ) : (
          <>
            <li className="px-4 pt-4">
              <p className="m-0 mb-2 text-sm" aria-live="polite">
                {remaining > 0 ? (
                  <>
                    Add <strong className="font-medium">{formatMoney(remaining)}</strong> more for free shipping
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-success">
                    <MaterialIcon name="check_circle" size={18} /> You have free shipping
                  </span>
                )}
              </p>
              <Progress
                value={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
                max={FREE_SHIPPING_THRESHOLD}
                label="Progress to free shipping"
                valueText={`${formatMoney(Math.min(subtotal, FREE_SHIPPING_THRESHOLD))} of ${formatMoney(FREE_SHIPPING_THRESHOLD)}`}
              />
            </li>
            <li className="px-4 pt-4">
              <Collection className="m-0" aria-label="Cart items">
                <CollectionHeader className="py-3">
                  <h3 className="m-0 text-base font-medium">Items</h3>
                </CollectionHeader>
                {lines.map((line) => (
                  <CollectionItem key={line.key} avatar data-testid="cart-line" className="pr-3">
                    <CollectionAvatar asChild className="bg-md-grey-100 dark:bg-md-grey-800">
                      <img src={productImage(line.product.kind, line.color.hex)} alt="" />
                    </CollectionAvatar>
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <CollectionTitle className="truncate font-medium">{line.product.name}</CollectionTitle>
                        <p className="m-0 text-sm text-muted-foreground">
                          {line.color.name}
                          {line.size ? ` · ${line.size}` : ""} · {formatPrice(line.product.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${line.product.name}`}
                        onClick={() => removeItem(line.key)}
                        className="-mr-1 -mt-1 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-error focus-visible:focus-ring"
                      >
                        <MaterialIcon name="delete_outline" size={20} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1" role="group" aria-label={`Quantity of ${line.product.name}`}>
                        <QtyButton label="Decrease quantity" disabled={line.qty <= 1} onClick={() => setQty(line.key, line.qty - 1)}>
                          <RemoveIcon />
                        </QtyButton>
                        <span className="w-7 text-center tabular-nums" aria-live="polite">
                          <span className="sr-only">Quantity </span>
                          {line.qty}
                        </span>
                        <QtyButton label="Increase quantity" disabled={line.qty >= MAX_QTY} onClick={() => setQty(line.key, line.qty + 1)}>
                          <AddIcon />
                        </QtyButton>
                      </div>
                      <span className="font-medium tabular-nums">{formatMoney(line.lineTotal)}</span>
                    </div>
                  </CollectionItem>
                ))}
              </Collection>
            </li>
            <li className="sticky bottom-0 z-[2] mt-auto bg-surface px-4 pb-4 pt-3 shadow-[0_-2px_6px_rgb(0_0_0/0.08)]">
              <dl className="m-0 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="m-0 tabular-nums" data-testid="cart-subtotal">
                    {formatMoney(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="m-0">{remaining > 0 ? "Calculated at checkout" : "Free"}</dd>
                </div>
              </dl>
              <Divider className="my-3" />
              <div className="flex items-baseline justify-between">
                <span className="text-base">Total</span>
                <span className="text-xl font-medium tabular-nums">{formatMoney(subtotal)}</span>
              </div>
              <Button
                color="primary"
                size="lg"
                className="mt-3 w-full"
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
              >
                <MaterialIcon name="lock" />
                Checkout
              </Button>
            </li>
          </>
        )}
      </SidenavContent>
    </Sidenav>
  );
}

function QtyButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-border text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:focus-ring disabled:cursor-default disabled:opacity-40 [&_svg]:size-4"
    >
      {children}
    </button>
  );
}
