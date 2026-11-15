"use client";

import * as React from "react";

import { CartSidenav } from "~/components/store/cart";
import { Checkout } from "~/components/store/checkout";
import type { CategoryId, SortKey } from "~/components/store/data";
import { DEFAULT_FILTERS, type Filters } from "~/components/store/filters";
import { QuickView } from "~/components/store/quick-view";
import { Shop } from "~/components/store/shop";
import { StoreFooter } from "~/components/store/store-footer";
import { AnnouncementBar, StoreNavbar } from "~/components/store/store-navbar";
import { CustomerCare, HeroSlider, Lookbook, MemberBanner, PerksStrip } from "~/components/store/store-sections";
import { StoreProvider, useStore } from "~/components/store/store-context";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Fab, FabAction, FabActions, FabTrigger } from "@/components/ui/fab";
import { MaterialIcon } from "@/components/ui/icons";
import { TapTarget, TapTargetContent, TapTargetDescription, TapTargetTitle } from "@/components/ui/tap-target";
import { Toaster, toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";

/** localStorage key remembering that the cart tour was shown. */
export const TOUR_KEY = "materializedcss-store-tour";

export function StoreApp(): React.JSX.Element {
  return (
    <StoreProvider>
      <Storefront />
    </StoreProvider>
  );
}

function Storefront(): React.JSX.Element {
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = React.useState<SortKey>("featured");
  const [page, setPage] = React.useState(1);
  const cartButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const updateFilters = React.useCallback((patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);
  const resetFilters = React.useCallback(() => {
    setFilters((current) => ({ ...DEFAULT_FILTERS, category: current.category }));
    setPage(1);
  }, []);

  const showCategory = (category: CategoryId | "all"): void => {
    updateFilters({ category });
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chat = (): void => {
    toast({ content: "Hi! A real person will reply in about 2 minutes.", duration: 5000 });
  };

  return (
    <div id="top" className="min-h-dvh bg-background">
      <AnnouncementBar />
      <StoreNavbar
        category={filters.category}
        onCategoryChange={(category) => updateFilters({ category })}
        onSearch={(query) => updateFilters({ query })}
        cartButtonRef={cartButtonRef}
      />
      <main>
        <HeroSlider onShop={showCategory} />
        <PerksStrip />
        <Divider />
        <Shop
          filters={filters}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
          sort={sort}
          onSortChange={(next) => {
            setSort(next);
            setPage(1);
          }}
          page={page}
          onPageChange={setPage}
        />
        <MemberBanner
          onJoin={() => toast({ content: "Welcome to the club! Your 10% code is PLANE10.", duration: 6000 })}
        />
        <Lookbook />
        <Divider />
        <CustomerCare onChat={chat} />
      </main>
      <StoreFooter onCategory={showCategory} />

      <QuickView />
      <CartSidenav />
      <Checkout />
      <StoreFab onChat={chat} />
      <CartTour targetRef={cartButtonRef} />
      <Toaster max={3} closeButton />
    </div>
  );
}

function StoreFab({ onChat }: { onChat: () => void }): React.JSX.Element {
  const { setCartOpen } = useStore();
  return (
    <Fab className="z-40">
      <FabTrigger aria-label="Quick actions">
        <MaterialIcon name="more_horiz" />
      </FabTrigger>
      <FabActions>
        <Tooltip content="Back to top" side="left">
          <FabAction
            label="Back to top"
            color="default"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <MaterialIcon name="arrow_upward" />
          </FabAction>
        </Tooltip>
        <Tooltip content="Chat with us" side="left">
          <FabAction label="Chat with us" color="success" onClick={onChat}>
            <MaterialIcon name="chat" />
          </FabAction>
        </Tooltip>
        <Tooltip content="View cart" side="left">
          <FabAction label="View cart" color="primary" onClick={() => setCartOpen(true)}>
            <MaterialIcon name="shopping_cart" />
          </FabAction>
        </Tooltip>
      </FabActions>
    </Fab>
  );
}

/** Feature discovery for the cart button, shown once per browser. */
function CartTour({ targetRef }: { targetRef: React.RefObject<HTMLButtonElement | null> }): React.JSX.Element {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(TOUR_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;
    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const close = (next: boolean): void => {
    setOpen(next);
    if (!next) {
      try {
        window.localStorage.setItem(TOUR_KEY, "1");
      } catch {
        // Storage can be unavailable (private mode); the tour then shows again next visit.
      }
    }
  };

  return (
    <TapTarget open={open} onOpenChange={close} targetRef={targetRef}>
      <TapTargetContent circleClassName="bg-md-teal-700">
        <TapTargetTitle>Your cart lives here</TapTargetTitle>
        <TapTargetDescription>
          Everything you add shows up in the cart. Open it to change quantities or check out.
        </TapTargetDescription>
        <Button variant="flat" className="mt-3 text-primary-foreground" onClick={() => close(false)}>
          Got it
        </Button>
      </TapTargetContent>
    </TapTarget>
  );
}
