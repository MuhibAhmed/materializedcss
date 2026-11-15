# materializedcss

Materialize's Material Design components, rebuilt for **React 19**, **Tailwind CSS v4** and **TypeScript**, and distributed the [shadcn/ui](https://ui.shadcn.com) way.

- **Same look, modern core.** Waves ripples, z-depth shadows, floating labels and the Materialize palette, with no jQuery and no anime.js.
- **You own the code.** `npx materializedcss add button` copies the component source into your project. You can also import the same components from the npm package.
- **Accessible.** Overlays, menus, selects, tabs and accordions use Radix primitives or WAI-ARIA patterns. Every component page passes an axe scan in CI.
- **Bugs fixed.** The iOS select mis-taps, dropdowns clipped inside modals, drifting tab indicators, stuck tooltips, XSS in toasts, tooltips and autocomplete, and leaking listeners are gone. Each docs page lists what changed.
- **Themeable.** Semantic CSS variables, a built-in dark mode, reduced-motion support and a default palette that meets WCAG AA.

## Quick start

In a React project that already uses Tailwind CSS v4:

```bash
npx materializedcss init
npx materializedcss add button card modal
```

```tsx
import { Button } from "@/components/ui/button";

export default function Page() {
  return <Button>Hello Material</Button>;
}
```

### As an npm package

```bash
npm install materializedcss
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "materializedcss/styles.css"; /* tokens + @source for the package's classes */
```

```tsx
import { Button, Card } from "materializedcss";
// or one component per entry point:
import { Modal } from "materializedcss/modal";
```

### With the shadcn CLI

Once the docs site is hosted, every component is also published as a shadcn-compatible registry item:

```bash
npx shadcn add https://materializedcss.dev/r/button.json
```

## Components

44 components, plus the hooks and utilities they share:

| Category | Components |
| --- | --- |
| Actions | Button, FAB (fixed action button) |
| Forms | Text field, Textarea, Checkbox, Radio group, Switch, Range, File input, Select (plus NativeSelect and MultiSelect), Autocomplete, Chip, Chips input, Datepicker, Timepicker |
| Data display | Badge, Collection, Table, Calendar |
| Layout | Card (with reveal), Collapsible, Footer |
| Navigation | Navbar, Sidenav, Tabs, Breadcrumbs, Pagination, Table of contents (ScrollSpy) |
| Overlays | Modal, Dropdown menu, Tooltip |
| Feedback | Toast, Preloader, Progress, Tap target (feature discovery) |
| Media and motion | Carousel, Slider, Parallax, Pushpin, Materialbox, Media |
| Foundations | Typography, Divider, Icons |

Hooks: `useRipple`, `useControllableState`, `useMediaQuery`, `useScrollSpy`.

## CLI

| Command | What it does |
| --- | --- |
| `materializedcss init` | Detects the framework and aliases, writes `materialized.json` and `lib/utils.ts`, installs the base dependencies and adds the theme import to your global CSS. |
| `materializedcss add <names...>` | Copies components and their registry dependencies, rewrites imports to your aliases and installs npm dependencies with your package manager. Accepts `--all`, `--yes`, `--overwrite`, `--path` and `--skip-install`. |
| `materializedcss list` | Lists the available components. |
| `materializedcss diff <name>` | Shows how your copy differs from the registry version. |

## Repository layout

```
packages/ui        npm package "materializedcss": components, hooks, theme.css, CLI and registry
  src/components/ui/   one file per component
  src/styles/theme.css Tailwind v4 tokens, palette, shadows and keyframes
  registry/*.json      per-component registry metadata
  scripts/             registry and build helpers
apps/docs          Next.js 16 docs and showcase site (imports the UI source directly)
  registry/examples/   live examples, shown as previews and highlighted source
  public/r/            generated shadcn-compatible registry
e2e                Playwright specs: one per component, axe checks and a CLI smoke test
```

## Development

```bash
npm install
npm run dev            # docs site on http://localhost:3000
npm run registry       # regenerate the registry and src/index.ts after changing registry/*.json
npm run build          # library + CLI (tsdown) and the docs site (next build)
npm run typecheck      # tsc --noEmit (TypeScript 7) for both workspaces
npm test               # vitest: CLI, hooks, date utilities
npm run e2e            # Playwright on chromium, firefox, webkit, Pixel 7 and iPhone 14
npm run e2e:chromium   # chromium only
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the conventions and the checklist each component follows: source, registry metadata, examples, docs page and an E2E spec.

### Notes on TypeScript 7

The repo uses TypeScript 7, the native compiler. It doesn't ship the classic JavaScript compiler API, so:

- Type checking runs through `tsc --noEmit` (`npm run typecheck`) rather than inside `next build`, which sets `typescript.ignoreBuildErrors`.
- Library declarations are emitted by `tsc -p tsconfig.build.json`, and `scripts/fix-dts.ts` rewrites the `@/` aliases.

## Credits

The design comes from [Materialize](https://github.com/Dogfalo/materialize) by Alvin Wang, Alan Chang, Alex Mark and Kevin Louie (MIT). This is an independent reimplementation, also under the MIT license.
