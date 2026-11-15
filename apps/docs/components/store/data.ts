/**
 * Mock catalog for the storefront example. Everything is static: there is no
 * backend, so filtering, sorting, pagination and the cart run in React state.
 */

export type ProductKind =
  | "sneaker"
  | "backpack"
  | "headphones"
  | "speaker"
  | "watch"
  | "camera"
  | "mug"
  | "lamp"
  | "plant"
  | "tee"
  | "sunglasses"
  | "bottle";

export type CategoryId = "apparel" | "audio" | "tech" | "home" | "outdoors";

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  brand: Brand;
  category: CategoryId;
  kind: ProductKind;
  /** Price in US dollars. */
  price: number;
  /** Original price when the product is on sale. */
  compareAt?: number;
  /** Average rating out of 5. */
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew?: boolean;
  colors: ProductColor[];
  /** Selectable sizes; empty for one-size products. */
  sizes: string[];
  /** Sizes that are sold out. */
  soldOutSizes?: string[];
  description: string;
  features: string[];
  /** Sort key for "Newest" (higher is newer). */
  added: number;
}

export const BRANDS = ["Arcadia", "Fjord", "Kiko", "Lumen", "Northwind", "Orbit"] as const;
export type Brand = (typeof BRANDS)[number];

export const CATEGORIES: Category[] = [
  { id: "apparel", label: "Apparel", icon: "checkroom" },
  { id: "audio", label: "Audio", icon: "headphones" },
  { id: "tech", label: "Tech", icon: "photo_camera" },
  { id: "home", label: "Home", icon: "chair" },
  { id: "outdoors", label: "Outdoors", icon: "terrain" },
];

/** Material Design 2014 palette swatches used for product colors. */
const C = {
  coral: { name: "Coral", hex: "#ef5350" },
  teal: { name: "Teal", hex: "#009688" },
  indigo: { name: "Indigo", hex: "#3f51b5" },
  amber: { name: "Amber", hex: "#ffb300" },
  slate: { name: "Slate", hex: "#546e7a" },
  orange: { name: "Orange", hex: "#ff7043" },
  green: { name: "Green", hex: "#43a047" },
  pink: { name: "Pink", hex: "#ec407a" },
  sky: { name: "Sky", hex: "#039be5" },
  cocoa: { name: "Cocoa", hex: "#8d6e63" },
  charcoal: { name: "Charcoal", hex: "#37474f" },
  purple: { name: "Purple", hex: "#8e24aa" },
  terracotta: { name: "Terracotta", hex: "#d4704a" },
  cream: { name: "Cream", hex: "#d7ccc8" },
  cyan: { name: "Cyan", hex: "#00acc1" },
} satisfies Record<string, ProductColor>;

const SHOE_SIZES = ["7", "8", "9", "10", "11", "12"];
const SHIRT_SIZES = ["XS", "S", "M", "L", "XL"];

export const PRODUCTS: Product[] = [
  {
    id: "trail-runner",
    name: "Trail Runner 2",
    brand: "Fjord",
    category: "apparel",
    kind: "sneaker",
    price: 99,
    compareAt: 129,
    rating: 4.7,
    reviews: 412,
    inStock: true,
    isNew: true,
    colors: [C.coral, C.teal, C.charcoal],
    sizes: SHOE_SIZES,
    soldOutSizes: ["12"],
    description: "A light, grippy runner for gravel mornings and city evenings, with a recycled knit upper.",
    features: ["Recycled knit upper", "Rock plate in the forefoot", "4 mm drop"],
    added: 24,
  },
  {
    id: "halo-anc",
    name: "Halo ANC Headphones",
    brand: "Lumen",
    category: "audio",
    kind: "headphones",
    price: 199,
    compareAt: 249,
    rating: 4.8,
    reviews: 1290,
    inStock: true,
    colors: [C.charcoal, C.cream, C.indigo],
    sizes: [],
    description: "Over-ear headphones with adaptive noise cancelling and a 40-hour battery.",
    features: ["Adaptive noise cancelling", "40 h battery, USB-C", "Fold-flat hinges"],
    added: 18,
  },
  {
    id: "daypack",
    name: "Daypack 22L",
    brand: "Fjord",
    category: "outdoors",
    kind: "backpack",
    price: 79,
    rating: 4.6,
    reviews: 388,
    inStock: true,
    colors: [C.orange, C.teal, C.slate],
    sizes: [],
    description: "A weatherproof everyday pack with a padded laptop sleeve and a lid pocket.",
    features: ["Fits a 16-inch laptop", "Water-resistant shell", "Lifetime warranty"],
    added: 15,
  },
  {
    id: "meridian-watch",
    name: "Meridian Watch",
    brand: "Arcadia",
    category: "tech",
    kind: "watch",
    price: 189,
    rating: 4.5,
    reviews: 96,
    inStock: true,
    isNew: true,
    colors: [C.cocoa, C.slate, C.green],
    sizes: [],
    description: "A minimalist automatic watch with a sapphire crystal and a vegetable-tanned strap.",
    features: ["Automatic movement", "Sapphire crystal", "50 m water resistance"],
    added: 23,
  },
  {
    id: "glaze-mug",
    name: "Glaze Mug",
    brand: "Kiko",
    category: "home",
    kind: "mug",
    price: 24,
    rating: 4.9,
    reviews: 640,
    inStock: true,
    colors: [C.sky, C.pink, C.amber, C.teal],
    sizes: [],
    description: "Hand-glazed stoneware that keeps coffee warm and looks good doing it.",
    features: ["350 ml", "Dishwasher safe", "Glazed by hand"],
    added: 9,
  },
  {
    id: "arc-lamp",
    name: "Arc Desk Lamp",
    brand: "Northwind",
    category: "home",
    kind: "lamp",
    price: 89,
    compareAt: 109,
    rating: 4.4,
    reviews: 152,
    inStock: true,
    colors: [C.amber, C.charcoal, C.teal],
    sizes: [],
    description: "A balanced-arm desk lamp with a dimmable, flicker-free LED.",
    features: ["Dimmable LED, 2700 K", "Balanced steel arm", "USB-C charging port"],
    added: 12,
  },
  {
    id: "pebble-speaker",
    name: "Pebble Speaker",
    brand: "Orbit",
    category: "audio",
    kind: "speaker",
    price: 79,
    rating: 4.3,
    reviews: 508,
    inStock: true,
    colors: [C.teal, C.coral, C.charcoal],
    sizes: [],
    description: "A splash-proof Bluetooth speaker that fills a room and fits a coat pocket.",
    features: ["IP67 splash-proof", "18 h playback", "Stereo pairing"],
    added: 8,
  },
  {
    id: "crew-tee",
    name: "Organic Crew Tee",
    brand: "Northwind",
    category: "apparel",
    kind: "tee",
    price: 29,
    rating: 4.5,
    reviews: 874,
    inStock: true,
    colors: [C.indigo, C.coral, C.green, C.charcoal],
    sizes: SHIRT_SIZES,
    soldOutSizes: ["XS"],
    description: "A heavyweight organic cotton tee with a relaxed fit that keeps its shape.",
    features: ["100% organic cotton", "Pre-shrunk", "Made in Portugal"],
    added: 6,
  },
  {
    id: "instant-mini",
    name: "Instant Camera Mini",
    brand: "Kiko",
    category: "tech",
    kind: "camera",
    price: 99,
    rating: 4.6,
    reviews: 233,
    inStock: true,
    colors: [C.pink, C.sky, C.cream],
    sizes: [],
    description: "Point, shoot and hold a print a minute later. Comes with a selfie mirror.",
    features: ["Credit-card sized prints", "Auto exposure", "Selfie mirror"],
    added: 20,
  },
  {
    id: "wayfarer",
    name: "Wayfarer Shades",
    brand: "Arcadia",
    category: "apparel",
    kind: "sunglasses",
    price: 119,
    rating: 4.2,
    reviews: 71,
    inStock: false,
    colors: [C.charcoal, C.cocoa, C.coral],
    sizes: [],
    description: "Acetate frames with polarized lenses and five-barrel hinges.",
    features: ["Polarized lenses", "UV400 protection", "Hand-polished acetate"],
    added: 4,
  },
  {
    id: "insulated-bottle",
    name: "Insulated Bottle 750ml",
    brand: "Fjord",
    category: "outdoors",
    kind: "bottle",
    price: 35,
    compareAt: 42,
    rating: 4.8,
    reviews: 1904,
    inStock: true,
    colors: [C.teal, C.orange, C.indigo, C.slate],
    sizes: [],
    description: "Double-walled steel: cold for 24 hours, hot for 12, and it never sweats.",
    features: ["24 h cold, 12 h hot", "Leak-proof lid", "BPA free"],
    added: 11,
  },
  {
    id: "monstera",
    name: "Monstera in Terracotta",
    brand: "Kiko",
    category: "home",
    kind: "plant",
    price: 45,
    rating: 4.7,
    reviews: 189,
    inStock: true,
    isNew: true,
    colors: [C.terracotta, C.cream, C.slate],
    sizes: [],
    description: "An easy-going monstera, potted in hand-thrown terracotta with a drainage dish.",
    features: ["40 cm tall", "Pet-safe care guide", "Saucer included"],
    added: 22,
  },
  {
    id: "court-classic",
    name: "Court Classic",
    brand: "Northwind",
    category: "apparel",
    kind: "sneaker",
    price: 89,
    rating: 4.4,
    reviews: 265,
    inStock: true,
    colors: [C.cream, C.indigo, C.green],
    sizes: SHOE_SIZES,
    soldOutSizes: ["7", "8"],
    description: "A low-top leather court shoe with a cupsole that only gets better with age.",
    features: ["Full-grain leather", "Stitched cupsole", "Cotton laces"],
    added: 3,
  },
  {
    id: "studio-cans",
    name: "Studio Monitor Cans",
    brand: "Orbit",
    category: "audio",
    kind: "headphones",
    price: 179,
    rating: 4.6,
    reviews: 341,
    inStock: true,
    colors: [C.slate, C.coral],
    sizes: [],
    description: "Flat, honest sound for mixing and long listening sessions, with a detachable cable.",
    features: ["50 mm drivers", "Detachable cable", "Swivel ear cups"],
    added: 10,
  },
  {
    id: "pulse-watch",
    name: "Pulse Smartwatch",
    brand: "Lumen",
    category: "tech",
    kind: "watch",
    price: 229,
    compareAt: 279,
    rating: 4.1,
    reviews: 412,
    inStock: true,
    colors: [C.charcoal, C.pink, C.sky],
    sizes: [],
    description: "Heart rate, sleep and GPS in a light aluminium case with a week of battery.",
    features: ["7-day battery", "Built-in GPS", "Swim-proof"],
    added: 17,
  },
  {
    id: "camp-mug",
    name: "Camp Enamel Mug",
    brand: "Fjord",
    category: "outdoors",
    kind: "mug",
    price: 18,
    rating: 4.5,
    reviews: 920,
    inStock: true,
    colors: [C.green, C.coral, C.slate],
    sizes: [],
    description: "Enamel-coated steel that survives the campfire and the dishwasher.",
    features: ["Enamel on steel", "Stackable", "300 ml"],
    added: 2,
  },
  {
    id: "dome-lamp",
    name: "Dome Lamp",
    brand: "Kiko",
    category: "home",
    kind: "lamp",
    price: 129,
    rating: 4.6,
    reviews: 58,
    inStock: false,
    colors: [C.pink, C.cream, C.teal],
    sizes: [],
    description: "A soft, mouth-blown glass dome that throws a warm pool of light.",
    features: ["Mouth-blown glass", "Touch dimmer", "E26 bulb included"],
    added: 14,
  },
  {
    id: "boom-tower",
    name: "Boom Tower",
    brand: "Lumen",
    category: "audio",
    kind: "speaker",
    price: 199,
    rating: 4.4,
    reviews: 127,
    inStock: true,
    isNew: true,
    colors: [C.indigo, C.charcoal],
    sizes: [],
    description: "A floor-standing speaker with room-filling bass and multi-room streaming.",
    features: ["Wi-Fi and Bluetooth", "Room calibration", "Multi-room"],
    added: 21,
  },
  {
    id: "fern-planter",
    name: "Fern Planter",
    brand: "Northwind",
    category: "home",
    kind: "plant",
    price: 32,
    compareAt: 38,
    rating: 4.3,
    reviews: 77,
    inStock: true,
    colors: [C.slate, C.terracotta],
    sizes: [],
    description: "A Boston fern in a matte ceramic planter. Loves bathrooms and bright shade.",
    features: ["Matte ceramic", "Self-watering insert", "25 cm tall"],
    added: 5,
  },
  {
    id: "pocket-tee",
    name: "Pocket Tee",
    brand: "Fjord",
    category: "apparel",
    kind: "tee",
    price: 34,
    rating: 4.2,
    reviews: 143,
    inStock: true,
    colors: [C.amber, C.teal, C.cocoa],
    sizes: SHIRT_SIZES,
    description: "A garment-dyed tee with a chest pocket and a slightly cropped body.",
    features: ["Garment dyed", "Chest pocket", "Boxy fit"],
    added: 13,
  },
  {
    id: "rangefinder",
    name: "Rangefinder X",
    brand: "Arcadia",
    category: "tech",
    kind: "camera",
    price: 649,
    rating: 4.9,
    reviews: 64,
    inStock: true,
    colors: [C.charcoal, C.cocoa],
    sizes: [],
    description: "A full-frame digital rangefinder with a bright optical viewfinder and manual dials.",
    features: ["24 MP full-frame", "Optical viewfinder", "Weather-sealed"],
    added: 19,
  },
  {
    id: "aviator",
    name: "Aviator Shades",
    brand: "Orbit",
    category: "apparel",
    kind: "sunglasses",
    price: 139,
    compareAt: 159,
    rating: 4.5,
    reviews: 210,
    inStock: true,
    colors: [C.amber, C.green, C.charcoal],
    sizes: [],
    description: "Titanium aviators with gradient lenses and adjustable nose pads.",
    features: ["Titanium frame", "Gradient lenses", "Hard case included"],
    added: 7,
  },
  {
    id: "trail-flask",
    name: "Trail Flask",
    brand: "Orbit",
    category: "outdoors",
    kind: "bottle",
    price: 28,
    rating: 3.9,
    reviews: 48,
    inStock: true,
    colors: [C.purple, C.cyan, C.coral],
    sizes: [],
    description: "A soft, collapsible flask that rolls up to the size of a gel when empty.",
    features: ["500 ml", "Collapsible", "Bite valve"],
    added: 16,
  },
  {
    id: "commuter-pack",
    name: "Commuter Roll-top",
    brand: "Arcadia",
    category: "outdoors",
    kind: "backpack",
    price: 129,
    rating: 4.7,
    reviews: 302,
    inStock: true,
    colors: [C.charcoal, C.cyan, C.coral],
    sizes: [],
    description: "A roll-top pack in waxed canvas with a quick-access side zip and bike light loop.",
    features: ["Waxed canvas", "Roll-top, 18 to 26 L", "Side laptop zip"],
    added: 1,
  },
];

export const PRICE_MIN = 0;
export const PRICE_MAX = 700;
export const FREE_SHIPPING_THRESHOLD = 75;
export const PAGE_SIZE = 9;

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export const SHIPPING_METHODS = [
  { id: "standard", label: "Standard", detail: "3 to 5 business days", price: 6 },
  { id: "express", label: "Express", detail: "1 to 2 business days", price: 14 },
  { id: "pickup", label: "Store pickup", detail: "Ready tomorrow in Lisbon", price: 0 },
] as const;
export type ShippingMethodId = (typeof SHIPPING_METHODS)[number]["id"];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const wholeCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** `$1,234.50` */
export function formatPrice(value: number): string {
  return Number.isInteger(value) ? wholeCurrency.format(value) : currency.format(value);
}

/** `$1,234.50` with cents always shown, for totals. */
export function formatMoney(value: number): string {
  return currency.format(value);
}

export function discountPercent(product: Product): number | null {
  if (!product.compareAt || product.compareAt <= product.price) return null;
  return Math.round((1 - product.price / product.compareAt) * 100);
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function categoryLabel(id: CategoryId | "all"): string {
  return id === "all" ? "All products" : (CATEGORIES.find((category) => category.id === id)?.label ?? id);
}
