/**
 * Flat Material Design illustrations for the mock products, generated as SVG
 * data URIs so they work in <img>, Materialbox, Carousel, Chip and Collection
 * avatars without any network request.
 */
import type { ProductKind } from "~/components/store/data";

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

/** Mix `hex` with white: `amount` 0 keeps the color, 1 is white. */
export function tint(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount]);
}

/** Mix `hex` with black: `amount` 0 keeps the color, 1 is black. */
export function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([r * (1 - amount), g * (1 - amount), b * (1 - amount)]);
}

interface Palette {
  main: string;
  dark: string;
  light: string;
}

function palette(hex: string): Palette {
  return { main: hex, dark: shade(hex, 0.28), light: tint(hex, 0.55) };
}

/** Watch-face tick marks around (cx, cy). */
function ticks(cx: number, cy: number, r: number): string {
  return Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const inner = i % 3 === 0 ? r - 9 : r - 5;
    const x1 = cx + Math.sin(angle) * inner;
    const y1 = cy - Math.cos(angle) * inner;
    const x2 = cx + Math.sin(angle) * r;
    const y2 = cy - Math.cos(angle) * r;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#455a64" stroke-width="${i % 3 === 0 ? 3 : 2}" stroke-linecap="round"/>`;
  }).join("");
}

/** The object itself, drawn in a 400 x 300 box centered on (200, 150). */
function drawObject(kind: ProductKind, hex: string): string {
  const { main, dark, light } = palette(hex);
  switch (kind) {
    case "sneaker":
      return `
        <path d="M86 214 H322 a12 12 0 0 1 0 24 H98 a12 12 0 0 1 -12 -12 Z" fill="#fafafa"/>
        <path d="M90 228 H330" stroke="#cfd8dc" stroke-width="3"/>
        <path d="M92 214 C86 184 96 150 116 130 C126 120 142 120 152 128 L178 148 C198 162 216 168 242 172 C280 177 308 184 320 198 C326 205 326 214 320 214 Z" fill="${main}"/>
        <path d="M92 214 C86 184 96 150 116 130 C120 152 124 188 134 214 Z" fill="${dark}"/>
        <path d="M262 174 C292 179 312 188 320 198 C326 205 326 214 320 214 L280 214 C280 198 272 184 262 174 Z" fill="${light}"/>
        <path d="M138 198 C182 198 222 188 256 176" stroke="#fff" stroke-width="10" stroke-linecap="round" fill="none" opacity=".92"/>
        <path d="M160 138 l12 -12 M176 150 l12 -12 M192 158 l12 -12 M208 164 l12 -11" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
        <path d="M116 130 C126 120 142 120 152 128" stroke="${dark}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    case "backpack":
      return `
        <path d="M178 92 C178 66 222 66 222 92" stroke="${dark}" stroke-width="9" fill="none" stroke-linecap="round"/>
        <rect x="126" y="122" width="20" height="100" rx="10" fill="${dark}"/>
        <rect x="254" y="122" width="20" height="100" rx="10" fill="${dark}"/>
        <rect x="140" y="86" width="120" height="164" rx="44" fill="${main}"/>
        <path d="M140 132 C140 104 162 86 200 86 C238 86 260 104 260 132 Z" fill="${dark}"/>
        <path d="M148 132 H252" stroke="${light}" stroke-width="3" stroke-dasharray="6 5"/>
        <rect x="158" y="172" width="84" height="62" rx="16" fill="${dark}"/>
        <path d="M168 188 H232" stroke="${light}" stroke-width="3" stroke-linecap="round"/>
        <rect x="192" y="128" width="16" height="50" rx="4" fill="${light}"/>
        <rect x="187" y="166" width="26" height="12" rx="3" fill="#263238" opacity=".55"/>`;
    case "headphones":
      return `
        <path d="M128 180 C128 88 272 88 272 180" stroke="${dark}" stroke-width="14" fill="none" stroke-linecap="round"/>
        <path d="M140 150 C150 108 250 108 260 150" stroke="${light}" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>
        <rect x="102" y="148" width="52" height="90" rx="24" fill="${main}"/>
        <rect x="246" y="148" width="52" height="90" rx="24" fill="${main}"/>
        <rect x="138" y="160" width="22" height="66" rx="11" fill="${dark}"/>
        <rect x="240" y="160" width="22" height="66" rx="11" fill="${dark}"/>
        <rect x="114" y="166" width="10" height="40" rx="5" fill="${light}" opacity=".75"/>`;
    case "speaker":
      return `
        <rect x="132" y="58" width="136" height="192" rx="24" fill="${main}"/>
        <rect x="132" y="58" width="136" height="192" rx="24" fill="none" stroke="${dark}" stroke-width="4" opacity=".4"/>
        <circle cx="200" cy="108" r="24" fill="${dark}"/>
        <circle cx="200" cy="108" r="10" fill="${shade(hex, 0.5)}"/>
        <circle cx="200" cy="184" r="46" fill="${dark}"/>
        <circle cx="200" cy="184" r="32" fill="${shade(hex, 0.48)}"/>
        <circle cx="200" cy="184" r="11" fill="${light}"/>
        <rect x="186" y="236" width="28" height="5" rx="2.5" fill="${light}"/>`;
    case "watch":
      return `
        <rect x="170" y="36" width="60" height="228" rx="16" fill="${dark}"/>
        <circle cx="200" cy="232" r="4" fill="${light}"/><circle cx="200" cy="248" r="4" fill="${light}"/>
        <rect x="258" y="140" width="16" height="20" rx="4" fill="${main}"/>
        <circle cx="200" cy="150" r="64" fill="${main}"/>
        <circle cx="200" cy="150" r="52" fill="#fafafa"/>
        ${ticks(200, 150, 46)}
        <line x1="200" y1="150" x2="200" y2="114" stroke="#263238" stroke-width="5" stroke-linecap="round"/>
        <line x1="200" y1="150" x2="228" y2="162" stroke="#263238" stroke-width="4" stroke-linecap="round"/>
        <line x1="200" y1="150" x2="176" y2="186" stroke="${main}" stroke-width="2" stroke-linecap="round"/>
        <circle cx="200" cy="150" r="5" fill="${main}"/>`;
    case "camera":
      return `
        <rect x="146" y="80" width="70" height="34" rx="8" fill="${dark}"/>
        <rect x="244" y="90" width="28" height="16" rx="4" fill="${dark}"/>
        <rect x="100" y="102" width="200" height="130" rx="20" fill="${main}"/>
        <rect x="100" y="130" width="200" height="74" fill="${dark}" opacity=".35"/>
        <circle cx="200" cy="167" r="52" fill="#eceff1"/>
        <circle cx="200" cy="167" r="41" fill="#263238"/>
        <circle cx="200" cy="167" r="26" fill="#455a64"/>
        <circle cx="200" cy="167" r="12" fill="#1c2529"/>
        <circle cx="186" cy="152" r="8" fill="#fff" opacity=".55"/>
        <rect x="254" y="114" width="32" height="16" rx="4" fill="#fff" opacity=".85"/>
        <circle cx="124" cy="118" r="6" fill="#fff" opacity=".85"/>`;
    case "mug":
      return `
        <path d="M168 92 C158 80 178 72 168 58 M196 92 C186 80 206 72 196 58 M224 92 C214 80 234 72 224 58" stroke="${dark}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".35"/>
        <path d="M250 140 C296 140 296 212 250 212" stroke="${main}" stroke-width="17" fill="none"/>
        <path d="M250 140 C296 140 296 212 250 212" stroke="${dark}" stroke-width="5" fill="none" opacity=".35"/>
        <rect x="132" y="108" width="124" height="136" rx="16" fill="${main}"/>
        <ellipse cx="194" cy="110" rx="62" ry="10" fill="${dark}"/>
        <rect x="132" y="150" width="124" height="22" fill="${light}" opacity=".6"/>
        <rect x="146" y="124" width="10" height="100" rx="5" fill="#fff" opacity=".25"/>`;
    case "lamp":
      return `
        <ellipse cx="160" cy="244" rx="58" ry="12" fill="${dark}"/>
        <path d="M160 238 L136 150 L238 104" stroke="${dark}" stroke-width="9" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
        <circle cx="136" cy="150" r="10" fill="${main}"/>
        <path d="M262 214 L196 186 L300 150 Z" fill="#fff59d" opacity=".55"/>
        <g transform="translate(244 104) rotate(32)">
          <path d="M-22 -8 L22 -8 L48 52 L-48 52 Z" fill="${main}"/>
          <ellipse cx="0" cy="52" rx="48" ry="9" fill="${dark}"/>
          <ellipse cx="0" cy="54" rx="20" ry="6" fill="#fff9c4"/>
        </g>`;
    case "plant":
      return `
        <path d="M200 188 C150 170 116 122 136 74 C170 96 196 138 200 188 Z" fill="#43a047"/>
        <path d="M200 188 C252 170 284 120 264 72 C232 96 204 140 200 188 Z" fill="#2e7d32"/>
        <path d="M200 188 C190 138 196 96 214 54 C232 98 218 150 200 188 Z" fill="#66bb6a"/>
        <path d="M200 188 C176 160 152 148 112 150 C132 178 166 190 200 188 Z" fill="#388e3c"/>
        <path d="M200 188 C222 162 248 150 290 154 C270 180 236 192 200 188 Z" fill="#558b2f"/>
        <path d="M200 186 C186 150 168 120 140 82 M200 186 C216 150 236 120 262 78 M200 186 C202 140 206 104 214 60" stroke="#c5e1a5" stroke-width="2.5" fill="none" opacity=".7"/>
        <path d="M152 186 H248 L236 250 H164 Z" fill="${main}"/>
        <rect x="144" y="178" width="112" height="22" rx="5" fill="${dark}"/>
        <path d="M168 216 H232" stroke="${light}" stroke-width="4" stroke-linecap="round" opacity=".7"/>`;
    case "tee":
      return `
        <path d="M160 66 L122 80 L82 122 L114 152 L136 132 L136 244 L264 244 L264 132 L286 152 L318 122 L278 80 L240 66 C232 88 168 88 160 66 Z" fill="${main}"/>
        <path d="M160 66 C168 88 232 88 240 66" stroke="${dark}" stroke-width="9" fill="none" stroke-linecap="round"/>
        <path d="M86 126 L114 152 M314 126 L286 152" stroke="${dark}" stroke-width="7" stroke-linecap="round"/>
        <path d="M136 236 H264" stroke="${dark}" stroke-width="5" opacity=".6"/>
        <rect x="220" y="114" width="28" height="30" rx="4" fill="${dark}" opacity=".45"/>
        <path d="M150 98 L150 230" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".14"/>`;
    case "sunglasses": {
      const lens = shade(hex, 0.62);
      return `
        <path d="M98 136 L66 118 M302 136 L334 118" stroke="${dark}" stroke-width="7" stroke-linecap="round"/>
        <path d="M98 132 H188 V160 C188 186 168 198 146 198 C120 198 98 184 98 160 Z" fill="${lens}"/>
        <path d="M212 132 H302 V160 C302 184 280 198 254 198 C232 198 212 186 212 160 Z" fill="${lens}"/>
        <path d="M98 132 H188 V160 C188 186 168 198 146 198 C120 198 98 184 98 160 Z M212 132 H302 V160 C302 184 280 198 254 198 C232 198 212 186 212 160 Z" fill="none" stroke="${main}" stroke-width="7" stroke-linejoin="round"/>
        <path d="M90 132 H310" stroke="${main}" stroke-width="12" stroke-linecap="round"/>
        <path d="M188 144 C194 136 206 136 212 144" stroke="${main}" stroke-width="7" fill="none"/>
        <path d="M112 146 L142 146 L118 184 Z M226 146 L256 146 L232 184 Z" fill="#fff" opacity=".22"/>`;
    }
    case "bottle":
      return `
        <path d="M186 58 C186 36 214 36 214 58" stroke="${dark}" stroke-width="7" fill="none"/>
        <rect x="178" y="54" width="44" height="38" rx="9" fill="${dark}"/>
        <rect x="164" y="86" width="72" height="166" rx="28" fill="${main}"/>
        <rect x="164" y="150" width="72" height="36" fill="${light}" opacity=".7"/>
        <rect x="178" y="100" width="11" height="136" rx="5.5" fill="#fff" opacity=".28"/>`;
  }
}

/** Gallery views used by the quick view carousel. */
export type ArtView = "front" | "detail" | "flat";

function scene(kind: ProductKind, hex: string, view: ArtView): string {
  const bgTop = view === "flat" ? tint(hex, 0.18) : tint(hex, 0.86);
  const bgBottom = view === "flat" ? shade(hex, 0.1) : tint(hex, 0.74);
  const disc = view === "flat" ? tint(hex, 0.32) : tint(hex, 0.62);
  const transform =
    view === "detail" ? "translate(-150 -120) scale(1.75)" : view === "flat" ? "translate(40 30) scale(.8)" : "";
  return `
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bgTop}"/><stop offset="1" stop-color="${bgBottom}"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#bg)"/>
    <circle cx="200" cy="150" r="118" fill="${disc}" opacity=".7"/>
    <circle cx="58" cy="52" r="10" fill="${disc}"/><circle cx="350" cy="236" r="16" fill="${disc}"/><circle cx="342" cy="58" r="5" fill="${disc}"/>
    <ellipse cx="200" cy="${view === "detail" ? 300 : 252}" rx="${view === "detail" ? 190 : 120}" ry="12" fill="#000" opacity=".1"/>
    <g transform="${transform}">${drawObject(kind, hex)}</g>`;
}

function toDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

const cache = new Map<string, string>();

/** A 400 x 300 product illustration as a data URI. */
export function productImage(kind: ProductKind, hex: string, view: ArtView = "front"): string {
  const key = `${kind}|${hex}|${view}`;
  let uri = cache.get(key);
  if (!uri) {
    uri = toDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="800" height="600">${scene(kind, hex, view)}</svg>`,
    );
    cache.set(key, uri);
  }
  return uri;
}

export interface BannerSpec {
  /** Gradient start and end colors. */
  from: string;
  to: string;
  /** Products drawn on the right side: kind, color, x, y, scale. */
  items: Array<{ kind: ProductKind; hex: string; x: number; y: number; scale: number }>;
}

/** A wide 1200 x 440 promotional banner for the hero slider. */
export function bannerImage({ from, to, items }: BannerSpec): string {
  const objects = items
    .map(
      (item) =>
        `<g transform="translate(${item.x} ${item.y}) scale(${item.scale})"><ellipse cx="200" cy="252" rx="120" ry="12" fill="#000" opacity=".16"/>${drawObject(item.kind, item.hex)}</g>`,
    )
    .join("");
  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 440" width="1200" height="440" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
      <rect width="1200" height="440" fill="url(#bg)"/>
      <circle cx="1010" cy="120" r="300" fill="#fff" opacity=".08"/>
      <circle cx="760" cy="470" r="220" fill="#fff" opacity=".06"/>
      <circle cx="120" cy="-40" r="180" fill="#000" opacity=".06"/>
      ${objects}
    </svg>`);
}
