"use client";

import * as React from "react";
import Link from "next/link";

import { ModeToggle } from "~/components/mode-toggle";
import { productImage } from "~/components/store/art";
import { CATEGORIES, type CategoryId, PRODUCTS, formatPrice } from "~/components/store/data";
import { useStore } from "~/components/store/store-context";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MaterialIcon, SearchIcon } from "@/components/ui/icons";
import { CircleImage } from "@/components/ui/media";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarLink, NavbarMenuButton, NavbarNav } from "@/components/ui/navbar";
import {
  Sidenav,
  SidenavContent,
  SidenavDivider,
  SidenavItem,
  SidenavSubheader,
  SidenavUserView,
} from "@/components/ui/sidenav";
import { toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SEARCH_OPTIONS: AutocompleteOption[] = PRODUCTS.map((product) => ({
  value: product.id,
  label: product.name,
  image: productImage(product.kind, product.colors[0]?.hex ?? "#9e9e9e"),
}));

const productNames = new Map(PRODUCTS.map((product) => [product.id, product]));

export interface StoreNavbarProps {
  category: CategoryId | "all";
  onCategoryChange: (category: CategoryId | "all") => void;
  /** Free-text search submitted from the search field. */
  onSearch: (query: string) => void;
  cartButtonRef: React.RefObject<HTMLButtonElement | null>;
}

/** Thin strip above the store bar with a link back to the docs and the theme toggle. */
export function AnnouncementBar(): React.JSX.Element {
  return (
    <div className="bg-md-grey-900 text-[13px] text-white/85">
      <div className="mx-auto flex h-9 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-sm text-white/85 no-underline hover:text-white focus-visible:focus-ring"
        >
          <MaterialIcon name="arrow_back" size={16} />
          <span className="hidden sm:inline">materializedcss</span>
          <span className="sm:hidden">Docs</span>
        </Link>
        <p className="m-0 flex-1 truncate text-center">
          <MaterialIcon name="local_shipping" size={16} className="mr-1.5 align-[-3px] text-md-teal-300" />
          Free shipping on orders over $75 <span className="hidden sm:inline">· 30-day returns</span>
        </p>
        <ModeToggle className="-mr-2 size-8 text-white hover:bg-white/15" />
      </div>
    </div>
  );
}

export function StoreNavbar({ category, onCategoryChange, onSearch, cartButtonRef }: StoreNavbarProps): React.JSX.Element {
  const { count, setCartOpen, setQuickViewId, wishlist } = useStore();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const submit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSearch(query.trim());
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pickCategory = (next: CategoryId | "all"): void => {
    onCategoryChange(next);
    setMenuOpen(false);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Navbar fixed className="z-40 dark:bg-[#2a1f20] dark:text-white">
        <NavbarContent className="mx-auto h-auto max-w-[1400px] flex-wrap gap-x-1 py-1 sm:h-auto sm:px-4 md:h-16 md:flex-nowrap md:py-0 lg:px-6">
          <NavbarMenuButton
            aria-label="Open store menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="lg:hidden"
          />
          <NavbarBrand asChild className="px-1 text-[1.45rem] font-light tracking-tight sm:text-[1.7rem] [&_.material-icons]:text-[1.9rem]!">
            <a href="#top">
              <MaterialIcon name="send" className="-rotate-[25deg]" />
              <span>
                paper<span className="font-medium">plane</span>
              </span>
            </a>
          </NavbarBrand>

          <NavbarNav aria-label="Store" align="start" className="ml-4 hidden lg:flex">
            {(["all", ...CATEGORIES.map((c) => c.id)] as const).map((id) => (
              <NavbarItem key={id}>
                <NavbarLink asChild active={category === id} className="px-3 text-[15px]">
                  <a
                    href="#shop"
                    onClick={(event) => {
                      event.preventDefault();
                      pickCategory(id);
                    }}
                  >
                    {id === "all" ? "Shop all" : CATEGORIES.find((c) => c.id === id)?.label}
                  </a>
                </NavbarLink>
              </NavbarItem>
            ))}
          </NavbarNav>

          <form
            role="search"
            aria-label="Products"
            onSubmit={submit}
            className="order-last mb-1.5 w-full md:order-none md:mx-4 md:mb-0 md:ml-auto md:w-72 xl:w-80"
          >
            <div className="group/search relative">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-2.5 top-1/2 z-[1] size-5! -translate-y-1/2 text-white/80 transition-colors group-focus-within/search:text-muted-foreground"
              />
              <Autocomplete
                label="Search products"
                labelClassName="sr-only"
                placeholder="Search sneakers, lamps, speakers..."
                className="m-0"
                inputClassName={cn(
                  "mb-0 h-10 rounded-ui border-0 bg-white/15 pl-10 pr-3 text-[15px] text-white shadow-none placeholder:text-white/75",
                  "focus:border-0 focus:bg-surface focus:text-foreground focus:shadow-z1 focus:placeholder:text-muted-foreground",
                )}
                value={query}
                onValueChange={setQuery}
                options={SEARCH_OPTIONS}
                limit={6}
                emptyMessage="No products match. Press Enter to search anyway."
                listboxClassName="rounded-ui"
                renderOption={(option, q) => {
                  const product = productNames.get(option.value);
                  return (
                    <span className="flex w-full items-center gap-3">
                      <img src={option.image} alt="" className="size-10 shrink-0 rounded-ui bg-md-grey-100 object-cover" />
                      <span className="min-w-0 flex-1 truncate">
                        <Highlight text={option.label ?? option.value} query={q} />
                      </span>
                      {product ? <span className="text-sm tabular-nums text-muted-foreground">{formatPrice(product.price)}</span> : null}
                    </span>
                  );
                }}
                onAutocomplete={(option) => {
                  setQuery("");
                  setQuickViewId(option.value);
                }}
              />
            </div>
          </form>

          <div className="ml-auto flex items-center md:ml-0">
            <DropdownMenu>
              <Tooltip content="Account">
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full outline-none transition-colors hover:bg-black/10 focus-visible:focus-ring"
                  >
                    <CircleImage src="/images/avatars/ada.svg" alt="" size={32} className="ring-2 ring-white/60" />
                  </button>
                </DropdownMenuTrigger>
              </Tooltip>
              <DropdownMenuContent coverTrigger={false} align="end" sideOffset={4} className="min-w-56">
                <DropdownMenuLabel>
                  <span className="block text-foreground">Ada Lovelace</span>
                  <span className="block text-xs font-normal text-muted-foreground">ada@example.com</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => toast("No orders yet. Your first one ships free.")}>
                  <MaterialIcon name="receipt_long" size={20} /> Orders
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast(`${wishlist.size} saved ${wishlist.size === 1 ? "item" : "items"} in your wishlist`)}>
                  <MaterialIcon name="favorite_border" size={20} /> Wishlist
                  <DropdownMenuShortcut>{wishlist.size}</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setCartOpen(true)}>
                  <MaterialIcon name="shopping_cart" size={20} /> Cart
                  <DropdownMenuShortcut>{count}</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onSelect={() => toast("Signed out (not really, this is a demo)")}>
                  <MaterialIcon name="logout" size={20} /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip content="Cart">
              <button
                ref={cartButtonRef}
                type="button"
                data-testid="cart-button"
                aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
                onClick={() => setCartOpen(true)}
                className="relative inline-flex size-12 cursor-pointer items-center justify-center rounded-full outline-none transition-colors hover:bg-black/10 focus-visible:focus-ring"
              >
                <MaterialIcon name="shopping_cart" />
                {count > 0 ? (
                  <Badge
                    key={count}
                    data-testid="cart-count"
                    variant="new"
                    color="secondary"
                    caption=""
                    aria-hidden="true"
                    className="absolute right-0.5 top-1 ml-0 h-5 min-w-5 animate-md-scale-in rounded-full px-1 text-xs font-medium leading-5 shadow-z1"
                  >
                    {count}
                  </Badge>
                ) : null}
              </button>
            </Tooltip>
          </div>
        </NavbarContent>
      </Navbar>

      <Sidenav open={menuOpen} onOpenChange={setMenuOpen}>
        <SidenavContent label="Store menu">
          <SidenavUserView
            background="/images/landscapes/dawn.svg"
            avatar="/images/avatars/ada.svg"
            avatarAlt="Ada Lovelace"
            name="Ada Lovelace"
            email="ada@example.com"
          />
          <SidenavSubheader>Shop by category</SidenavSubheader>
          <SidenavItem asChild active={category === "all"}>
            <button type="button" onClick={() => pickCategory("all")}>
              <MaterialIcon name="storefront" className="mr-8 text-muted-foreground" />
              Shop all
            </button>
          </SidenavItem>
          {CATEGORIES.map((c) => (
            <SidenavItem key={c.id} asChild active={category === c.id}>
              <button type="button" onClick={() => pickCategory(c.id)}>
                <MaterialIcon name={c.icon} className="mr-8 text-muted-foreground" />
                {c.label}
              </button>
            </SidenavItem>
          ))}
          <SidenavDivider />
          <SidenavItem asChild>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setCartOpen(true);
              }}
            >
              <MaterialIcon name="shopping_cart" className="mr-8 text-muted-foreground" />
              Cart
              {count > 0 ? (
                <Badge variant="new" caption="" className="ml-auto min-w-6 rounded-full">
                  {count}
                </Badge>
              ) : null}
            </button>
          </SidenavItem>
          <SidenavItem href="#care" icon={<MaterialIcon name="support_agent" />} onClick={() => setMenuOpen(false)}>
            Customer care
          </SidenavItem>
          <SidenavItem asChild>
            <Link href="/docs">
              <MaterialIcon name="menu_book" className="mr-8 text-muted-foreground" />
              materializedcss docs
            </Link>
          </SidenavItem>
        </SidenavContent>
      </Sidenav>
    </>
  );
}

function Highlight({ text, query }: { text: string; query: string }): React.JSX.Element {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-transparent font-medium text-foreground">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}
