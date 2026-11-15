"use client";

import * as React from "react";

import { FREE_SHIPPING_THRESHOLD, type Product, type ProductColor, getProduct } from "~/components/store/data";
import { toast } from "@/components/ui/toast";

export interface CartItem {
  /** Unique per product, color and size. */
  key: string;
  productId: string;
  color: ProductColor;
  size: string | null;
  qty: number;
}

export interface AddToCartOptions {
  color?: ProductColor | undefined;
  size?: string | null | undefined;
  qty?: number | undefined;
}

interface StoreContextValue {
  items: CartItem[];
  /** Number of units in the cart. */
  count: number;
  subtotal: number;
  addItem: (product: Product, options?: AddToCartOptions) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  /** Product shown in the quick view modal. */
  quickViewId: string | null;
  setQuickViewId: (id: string | null) => void;
  wishlist: ReadonlySet<string>;
  toggleWishlist: (product: Product) => void;
}

const StoreContext = React.createContext<StoreContextValue | null>(null);

export const MAX_QTY = 10;

/** Cart lines with their product, skipping ids that no longer exist. */
export function useCartLines(): Array<CartItem & { product: Product; lineTotal: number }> {
  const { items } = useStore();
  return items.flatMap((item) => {
    const product = getProduct(item.productId);
    return product ? [{ ...item, product, lineTotal: product.price * item.qty }] : [];
  });
}

export function useStore(): StoreContextValue {
  const context = React.useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside <StoreProvider>");
  return context;
}

export function shippingFor(subtotal: number, method: { price: number }): number {
  if (subtotal === 0) return 0;
  if (method.price > 0 && subtotal >= FREE_SHIPPING_THRESHOLD && method.price < 10) return 0;
  return method.price;
}

export function StoreProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [quickViewId, setQuickViewId] = React.useState<string | null>(null);
  const [wishlist, setWishlist] = React.useState<ReadonlySet<string>>(() => new Set());

  const addItem = React.useCallback((product: Product, options: AddToCartOptions = {}) => {
    const color = options.color ?? product.colors[0] ?? { name: "Default", hex: "#9e9e9e" };
    const size = options.size ?? (product.sizes.find((s) => !product.soldOutSizes?.includes(s)) ?? null);
    const qty = options.qty ?? 1;
    const key = `${product.id}|${color.name}|${size ?? ""}`;
    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) => (item.key === key ? { ...item, qty: Math.min(MAX_QTY, item.qty + qty) } : item));
      }
      return [...current, { key, productId: product.id, color, size, qty }];
    });
    toast({
      id: "cart-added",
      content: (
        <span>
          Added <strong className="font-medium">{product.name}</strong> to your cart
        </span>
      ),
      action: { label: "View cart", onClick: () => setCartOpen(true) },
    });
  }, []);

  const setQty = React.useCallback((key: string, qty: number) => {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : item)),
    );
  }, []);

  const removeItem = React.useCallback((key: string) => {
    let removed: { item: CartItem; index: number } | null = null;
    setItems((current) => {
      const index = current.findIndex((item) => item.key === key);
      const item = current[index];
      if (!item) return current;
      removed = { item, index };
      return current.filter((entry) => entry.key !== key);
    });
    const product = getProduct(key.split("|")[0] ?? "");
    toast({
      id: "cart-removed",
      content: `Removed ${product?.name ?? "item"}`,
      action: {
        label: "Undo",
        onClick: () => {
          const snapshot = removed as { item: CartItem; index: number } | null;
          if (!snapshot) return;
          setItems((current) => {
            if (current.some((entry) => entry.key === snapshot.item.key)) return current;
            const next = [...current];
            next.splice(snapshot.index, 0, snapshot.item);
            return next;
          });
        },
      },
    });
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const toggleWishlist = React.useCallback((product: Product) => {
    setWishlist((current) => {
      const next = new Set(current);
      if (next.has(product.id)) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
  }, []);

  const value = React.useMemo<StoreContextValue>(() => {
    const count = items.reduce((total, item) => total + item.qty, 0);
    const subtotal = items.reduce((total, item) => total + (getProduct(item.productId)?.price ?? 0) * item.qty, 0);
    return {
      items,
      count,
      subtotal,
      addItem,
      setQty,
      removeItem,
      clear,
      cartOpen,
      setCartOpen,
      checkoutOpen,
      setCheckoutOpen,
      quickViewId,
      setQuickViewId,
      wishlist,
      toggleWishlist,
    };
  }, [items, addItem, setQty, removeItem, clear, cartOpen, checkoutOpen, quickViewId, wishlist, toggleWishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
