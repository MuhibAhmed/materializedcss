"use client";

import * as React from "react";

import {
  type Filters,
  FiltersPanel,
  activeFilterCount,
  filterProducts,
  sortProducts,
} from "~/components/store/filters";
import {
  CATEGORIES,
  type CategoryId,
  PAGE_SIZE,
  PRICE_MAX,
  PRICE_MIN,
  PRODUCTS,
  SORT_OPTIONS,
  type SortKey,
  categoryLabel,
} from "~/components/store/data";
import { ProductCard } from "~/components/store/product-card";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumbs,
} from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { MaterialIcon } from "@/components/ui/icons";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { PaginationControl } from "@/components/ui/pagination";
import { Preloader } from "@/components/ui/preloader";
import { Pushpin } from "@/components/ui/pushpin";
import { Select, SelectItem } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const TABS: Array<{ id: CategoryId | "all"; label: string; icon: string }> = [
  { id: "all", label: "All", icon: "apps" },
  ...CATEGORIES,
];

export interface ShopProps {
  filters: Filters;
  onFiltersChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  page: number;
  onPageChange: (page: number) => void;
}

/** Breadcrumbs, category tabs, filter chips, sort, product grid and pagination. */
export function Shop({ filters, onFiltersChange, onReset, sort, onSortChange, page, onPageChange }: ShopProps): React.JSX.Element {
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const desktop = useMediaQuery("(min-width: 64rem)");
  const loadTimer = React.useRef<number | undefined>(undefined);

  const results = React.useMemo(() => sortProducts(filterProducts(PRODUCTS, filters), sort), [filters, sort]);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const activeCount = activeFilterCount(filters);

  React.useEffect(() => () => window.clearTimeout(loadTimer.current), []);
  // The filters modal is for small screens only.
  React.useEffect(() => {
    if (desktop) setFiltersOpen(false);
  }, [desktop]);

  const goToPage = (next: number): void => {
    window.clearTimeout(loadTimer.current);
    setLoading(true);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Simulate fetching the next page from a server.
    loadTimer.current = window.setTimeout(() => {
      onPageChange(next);
      setLoading(false);
    }, 600);
  };

  const removableChips: Array<{ key: string; label: string; remove: () => void }> = [
    ...(filters.query
      ? [{ key: "query", label: `“${filters.query}”`, remove: () => onFiltersChange({ query: "" }) }]
      : []),
    ...filters.brands.map((brand) => ({
      key: `brand-${brand}`,
      label: brand,
      remove: () => onFiltersChange({ brands: filters.brands.filter((b) => b !== brand) }),
    })),
    ...(filters.price[0] !== PRICE_MIN || filters.price[1] !== PRICE_MAX
      ? [
          {
            key: "price",
            label: `$${filters.price[0]} to $${filters.price[1]}`,
            remove: () => onFiltersChange({ price: [PRICE_MIN, PRICE_MAX] }),
          },
        ]
      : []),
    ...(filters.rating > 0
      ? [{ key: "rating", label: `${filters.rating}+ stars`, remove: () => onFiltersChange({ rating: 0 }) }]
      : []),
  ];

  const quickFilters = [
    { key: "onSale", label: "On sale", icon: "local_offer", on: filters.onSale, toggle: () => onFiltersChange({ onSale: !filters.onSale }) },
    { key: "newOnly", label: "New arrivals", icon: "fiber_new", on: filters.newOnly, toggle: () => onFiltersChange({ newOnly: !filters.newOnly }) },
    {
      key: "inStockOnly",
      label: "In stock",
      icon: "inventory_2",
      on: filters.inStockOnly,
      toggle: () => onFiltersChange({ inStockOnly: !filters.inStockOnly }),
    },
  ];

  const grid = (
    <div className="relative" aria-busy={loading}>
      {visible.length > 0 ? (
        <ul
          aria-label="Products"
          className={cn(
            "m-0 grid list-none grid-cols-2 gap-3 p-0 sm:gap-5 xl:grid-cols-3",
            loading && "pointer-events-none opacity-40 transition-opacity",
          )}
        >
          {visible.map((product) => (
            <li key={product.id} className="min-w-0">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-ui bg-surface px-6 py-16 text-center shadow-z1">
          <MaterialIcon name="search_off" size={48} className="text-muted-foreground" />
          <p className="m-0 text-lg">No products match these filters</p>
          <p className="m-0 text-sm text-muted-foreground">Try removing a filter or searching for something else.</p>
          <Button className="mt-2" color="secondary" onClick={onReset}>
            Clear filters
          </Button>
        </div>
      )}
      {loading ? (
        <div className="absolute inset-x-0 top-16 flex justify-center">
          <div className="rounded-full bg-surface p-3 shadow-z2">
            <Preloader multicolor label="Loading products" />
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <section id="shop" aria-labelledby="shop-title" className="mx-auto max-w-[1400px] scroll-mt-24 px-4 pb-10 pt-6 sm:px-6 md:scroll-mt-16">
      <Breadcrumbs className="text-sm text-muted-foreground [&_a]:text-muted-foreground [&_a:hover]:text-foreground">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#top">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {filters.category === "all" ? (
            <BreadcrumbItem>
              <BreadcrumbPage>Shop</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#shop"
                  onClick={(event) => {
                    event.preventDefault();
                    onFiltersChange({ category: "all" });
                  }}
                >
                  Shop
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{categoryLabel(filters.category)}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumbs>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 id="shop-title" className="m-0 text-[2rem] font-light leading-tight sm:text-[2.4rem]">
            {filters.category === "all" ? "Shop all" : categoryLabel(filters.category)}
          </h1>
          <p className="m-0 mt-1 text-sm text-muted-foreground" aria-live="polite" data-testid="result-count">
            {results.length} {results.length === 1 ? "product" : "products"}
            {results.length > PAGE_SIZE ? ` · page ${current} of ${totalPages}` : ""}
          </p>
        </div>
        <div className="flex w-full items-end gap-3 sm:w-auto">
          <Button
            variant="outlined"
            color="secondary"
            className="mb-2 shrink-0 lg:hidden"
            onClick={() => setFiltersOpen(true)}
            aria-haspopup="dialog"
          >
            <MaterialIcon name="tune" />
            Filters
            {activeCount ? (
              <span className="ml-1 rounded-full bg-secondary px-1.5 text-xs leading-5 text-secondary-foreground">{activeCount}</span>
            ) : null}
          </Button>
          <Select
            label="Sort by"
            value={sort}
            onValueChange={(value) => onSortChange(value as SortKey)}
            className="min-w-0 flex-1 sm:w-56 sm:flex-none"
          >
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside aria-label="Product filters" className="hidden lg:block">
          <Pushpin top={80}>
            <div className="-m-1 max-h-[calc(100dvh-96px)] overflow-y-auto p-1 [scrollbar-width:thin]">
              <FiltersPanel idPrefix="side" filters={filters} onChange={onFiltersChange} onReset={onReset} />
            </div>
          </Pushpin>
        </aside>

        <div className="min-w-0">
          <Tabs value={filters.category} onValueChange={(value) => onFiltersChange({ category: value as CategoryId | "all" })}>
            <TabsList aria-label="Categories" className="rounded-ui bg-surface shadow-z1">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                  <MaterialIcon name={tab.icon} size={18} className="max-sm:hidden" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Quick filters">
              {quickFilters.map((chip) => (
                <Chip key={chip.key} asChild selected={chip.on}>
                  <button type="button" aria-pressed={chip.on} onClick={chip.toggle}>
                    <MaterialIcon name={chip.on ? "check" : chip.icon} size={18} className="-ml-1 mr-1.5" />
                    {chip.label}
                  </button>
                </Chip>
              ))}
              {removableChips.map((chip) => (
                <Chip key={chip.key} onDelete={chip.remove} deleteLabel={`Remove filter ${chip.label}`}>
                  {chip.label}
                </Chip>
              ))}
              {removableChips.length > 1 ? (
                <Button variant="flat" size="sm" color="secondary" onClick={onReset}>
                  Clear all
                </Button>
              ) : null}
            </div>

            {TABS.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-5 outline-none" tabIndex={-1}>
                {tab.id === filters.category ? grid : null}
              </TabsContent>
            ))}
          </Tabs>

          {totalPages > 1 ? (
            <PaginationControl
              className="mt-8 justify-center"
              page={current}
              total={totalPages}
              onPageChange={goToPage}
              aria-label="Product pages"
            />
          ) : null}
        </div>
      </div>

      <Modal open={filtersOpen} onOpenChange={setFiltersOpen}>
        <ModalContent variant="fixed-footer" className="w-[94%] sm:w-[70%]">
          <ModalHeader className="sr-only">
            <ModalTitle>Filters</ModalTitle>
            <ModalDescription>Narrow down the products shown.</ModalDescription>
          </ModalHeader>
          <ModalBody className="p-4">
            <FiltersPanel idPrefix="modal" filters={filters} onChange={onFiltersChange} onReset={onReset} />
          </ModalBody>
          <ModalFooter className="justify-end gap-2 px-4">
            <Button variant="flat" onClick={() => setFiltersOpen(false)}>
              Close
            </Button>
            <Button color="primary" onClick={() => setFiltersOpen(false)}>
              Show {results.length} {results.length === 1 ? "result" : "results"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}
