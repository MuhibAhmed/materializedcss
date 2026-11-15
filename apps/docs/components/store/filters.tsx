"use client";

import * as React from "react";

import { BRANDS, type Brand, type CategoryId, PRICE_MAX, PRICE_MIN, PRODUCTS, type Product, type SortKey } from "~/components/store/data";
import { Rating } from "~/components/store/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleBody, CollapsibleHeader, CollapsibleItem } from "@/components/ui/collapsible";
import { MaterialIcon } from "@/components/ui/icons";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Range } from "@/components/ui/range";
import { Switch } from "@/components/ui/switch";

export interface Filters {
  category: CategoryId | "all";
  query: string;
  brands: Brand[];
  price: [number, number];
  /** Minimum rating, 0 for any. */
  rating: number;
  inStockOnly: boolean;
  onSale: boolean;
  newOnly: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  category: "all",
  query: "",
  brands: [],
  price: [PRICE_MIN, PRICE_MAX],
  rating: 0,
  inStockOnly: false,
  onSale: false,
  newOnly: false,
};

/** Filters other than the category tab and the search query that are set. */
export function activeFilterCount(filters: Filters): number {
  return (
    filters.brands.length +
    (filters.price[0] !== PRICE_MIN || filters.price[1] !== PRICE_MAX ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.newOnly ? 1 : 0)
  );
}

export function filterProducts(products: readonly Product[], filters: Filters, ignore?: "brands"): Product[] {
  const query = filters.query.trim().toLowerCase();
  return products.filter((product) => {
    if (filters.category !== "all" && product.category !== filters.category) return false;
    if (
      query &&
      !`${product.name} ${product.brand} ${product.kind} ${product.category}`.toLowerCase().includes(query)
    ) {
      return false;
    }
    if (ignore !== "brands" && filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (product.price < filters.price[0] || product.price > filters.price[1]) return false;
    if (product.rating < filters.rating) return false;
    if (filters.inStockOnly && !product.inStock) return false;
    if (filters.onSale && !product.compareAt) return false;
    if (filters.newOnly && !product.isNew) return false;
    return true;
  });
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "newest":
      return sorted.sort((a, b) => b.added - a.added);
    default:
      return sorted;
  }
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export interface FiltersPanelProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  /** Distinguishes ids when the panel is rendered twice (sidebar and mobile modal). */
  idPrefix: string;
}

/** Brand, price, rating and availability filters in an expandable list. */
export function FiltersPanel({ filters, onChange, onReset, idPrefix }: FiltersPanelProps): React.JSX.Element {
  const brandCounts = React.useMemo(() => {
    const counts = new Map<Brand, number>();
    for (const product of filterProducts(PRODUCTS, filters, "brands")) {
      counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    }
    return counts;
  }, [filters]);

  const toggleBrand = (brand: Brand, checked: boolean): void => {
    onChange({
      brands: checked ? [...filters.brands, brand] : filters.brands.filter((b) => b !== brand),
    });
  };

  const priceLabelId = `${idPrefix}-price-label`;
  const count = activeFilterCount(filters);

  return (
    <div data-slot="store-filters">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="m-0 flex items-center gap-2 text-lg font-normal">
          <MaterialIcon name="tune" size={20} className="text-muted-foreground" />
          Filters
        </h2>
        <Button variant="flat" size="sm" color="secondary" disabled={count === 0} onClick={onReset} className="-mr-2">
          Clear all
        </Button>
      </div>
      <Collapsible type="multiple" defaultValue={["brand", "price", "rating", "availability"]} className="m-0">
        <CollapsibleItem value="brand">
          <CollapsibleHeader icon={<MaterialIcon name="sell" />}>
            Brand
            {filters.brands.length ? (
              <span className="ml-2 rounded-full bg-secondary px-1.5 text-xs leading-5 text-secondary-foreground">
                {filters.brands.length}
              </span>
            ) : null}
          </CollapsibleHeader>
          <CollapsibleBody innerClassName="space-y-1 px-5 py-3">
            {BRANDS.map((brand) => (
              <div key={brand} className="flex items-center justify-between gap-2">
                <Checkbox
                  id={`${idPrefix}-brand-${brand}`}
                  variant="filled-in"
                  label={brand}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={(checked) => toggleBrand(brand, checked === true)}
                />
                <span className="text-xs tabular-nums text-muted-foreground">{brandCounts.get(brand) ?? 0}</span>
              </div>
            ))}
          </CollapsibleBody>
        </CollapsibleItem>
        <CollapsibleItem value="price">
          <CollapsibleHeader icon={<MaterialIcon name="payments" />}>Price</CollapsibleHeader>
          <CollapsibleBody innerClassName="px-5 pb-4 pt-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span id={priceLabelId}>Price range</span>
              <span aria-live="polite" className="tabular-nums text-foreground">
                {money.format(filters.price[0])} to {money.format(filters.price[1])}
              </span>
            </div>
            <Range
              aria-labelledby={priceLabelId}
              className="mt-8"
              value={filters.price}
              onValueChange={(value) => onChange({ price: [value[0] ?? PRICE_MIN, value[1] ?? PRICE_MAX] })}
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={10}
              minStepsBetweenThumbs={2}
              formatValue={(value) => `$${value}`}
              getAriaValueText={(value) => money.format(value)}
            />
          </CollapsibleBody>
        </CollapsibleItem>
        <CollapsibleItem value="rating">
          <CollapsibleHeader icon={<MaterialIcon name="star_border" />}>Rating</CollapsibleHeader>
          <CollapsibleBody innerClassName="px-5 py-3">
            <RadioGroup
              aria-label="Minimum rating"
              variant="with-gap"
              value={String(filters.rating)}
              onValueChange={(value) => onChange({ rating: Number(value) })}
              className="gap-1"
            >
              {[4.5, 4, 3].map((value) => (
                <RadioGroupItem
                  key={value}
                  id={`${idPrefix}-rating-${value}`}
                  value={String(value)}
                  aria-label={`${value} stars and up`}
                  label={
                    <span className="inline-flex items-center gap-1">
                      <Rating value={value} size={16} />
                      <span className="text-sm">& up</span>
                    </span>
                  }
                />
              ))}
              <RadioGroupItem id={`${idPrefix}-rating-0`} value="0" label="Any rating" />
            </RadioGroup>
          </CollapsibleBody>
        </CollapsibleItem>
        <CollapsibleItem value="availability">
          <CollapsibleHeader icon={<MaterialIcon name="inventory_2" />}>Availability</CollapsibleHeader>
          <CollapsibleBody innerClassName="space-y-4 px-5 py-4">
            <Switch
              id={`${idPrefix}-stock`}
              label="In stock only"
              checked={filters.inStockOnly}
              onCheckedChange={(checked) => onChange({ inStockOnly: checked })}
            />
            <Switch
              id={`${idPrefix}-sale`}
              label="On sale"
              checked={filters.onSale}
              onCheckedChange={(checked) => onChange({ onSale: checked })}
            />
          </CollapsibleBody>
        </CollapsibleItem>
      </Collapsible>
    </div>
  );
}
