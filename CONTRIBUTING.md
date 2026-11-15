# Contributing to materializedcss

materializedcss rebuilds [Materialize](https://materializecss.com) (Material Design 1) as React 19 + Tailwind CSS v4 + TypeScript components that are distributed shadcn-style (a CLI copies source into your app) and as an npm package.

## Repo layout

```
packages/ui/                      npm package "materializedcss" (components + CLI)
  src/styles/theme.css            Tailwind v4 tokens: colors, z-depth shadows, easing, keyframes, palette
  src/lib/utils.ts                cn(), composeEventHandlers(), prefersReducedMotion()
  src/hooks/*.ts                  use-ripple, use-controllable-state, use-media-query, ...
  src/components/ui/<name>.tsx    one file per component
  registry/<name>.json            registry meta for each item (drives CLI, shadcn registry, docs sidebar)
  scripts/build-registry.ts       validates meta, writes dist/registry, apps/docs/public/r and src/index.ts
apps/docs/                        Next.js 16 docs + showcase
  app/docs/components/<name>/page.tsx
  registry/examples/<name>-<example>.tsx
  components/docs/*               ComponentDoc, ComponentPreview, Installation, DocSection, PropsTable, Callout, CodeBlock
e2e/<name>.spec.ts                Playwright tests (helpers in e2e/utils.ts)
```

## Adding a component (checklist)

1. **Source**: `packages/ui/src/components/ui/<name>.tsx`.
2. **Registry meta**: `packages/ui/registry/<name>.json` (copy `button.json`). Fields: `name` (= file name), `type: "registry:ui"`, `title`, `description` (one sentence, shown as page subtitle), `category` (one of: Foundations, Actions, Forms, Data Display, Navigation, Overlays, Feedback, Layout, Media & Motion), `dependencies` (npm), `registryDependencies` (other registry names, e.g. `utils`, `use-ripple`, `icons`, `button`), `files`, and `improvements` (3–6 short sentences on what is fixed or better than Materialize).
3. **Examples**: `apps/docs/registry/examples/<name>-demo.tsx` plus one file per variant (`<name>-<variant>.tsx`). Each file exports exactly one named component (PascalCase of the file name, e.g. `CardReveal`). Import components from `@/components/ui/<name>` exactly as users will. Keep examples realistic and short. They are shown verbatim in the Code tab.
4. **Docs page**: `apps/docs/app/docs/components/<name>/page.tsx`. Follow `button/page.tsx`: `<ComponentDoc name>` → main `<ComponentPreview>` → `Installation` → `Usage` → one `DocSection` per variant/feature → `API Reference` (`PropsTable`) → `Accessibility` (keyboard interactions table or list).
5. **E2E**: `e2e/<name>.spec.ts` (copy `e2e/button.spec.ts`). Cover: rendering, every interaction path (mouse, keyboard, touch where relevant), controlled + uncontrolled values, open/close paths and focus return for overlays, reduced motion where relevant, and `expectNoA11yViolations(page, "[data-doc-content]")`. Use roles/labels, not test ids. Scope locators with `preview(page, "<example-file-name>")`.

## Component conventions

- **React 19**: no `forwardRef`; `ref` is a regular prop (`React.ComponentProps<"div">` includes it). Every exported function has an explicit return type (`React.JSX.Element`), every props interface is exported and documented with JSDoc on each custom prop.
- **`"use client"`** at the top of any file using hooks, state, effects, refs or event handlers. Pure presentational components (Badge, Card, Table...) should stay server-compatible (no directive).
- **Imports** inside `packages/ui/src` only via the aliases `@/lib/utils`, `@/hooks/<name>`, `@/components/ui/<name>` (the CLI rewrites them). Never relative imports between components.
- **Names**: export names must be unique across the whole library (`src/index.ts` re-exports everything). Prefix sub-components with the component name (`CardTitle`, `CardAction`, `ModalFooter`, `TabsList`). Variant helpers are `<name>Variants`.
- **Styling**: Tailwind classes only, composed with `cn()` and `cva` for variants. Accept `className` on every rendered part, and add `data-slot="<part>"` on each part. Use theme tokens, never hard-coded hex: `bg-surface`, `bg-surface-2`, `text-foreground`, `text-muted-foreground`, `border-border`, `border-input`, `bg-primary`/`text-primary-foreground`, `bg-secondary`/`text-secondary-foreground`, `bg-secondary-light`, `text-error`, `text-success`, `text-link`, `text-card-link`, `bg-snackbar`/`text-snackbar-foreground`/`text-snackbar-action`, `bg-overlay`, `bg-disabled`/`text-disabled-foreground`, `bg-surface-hover`, `bg-surface-active`. Radius: `rounded-ui` (2px, Materialize default). Elevation: `shadow-z1`, `shadow-z1-half`, `shadow-z2` ... `shadow-z5`, `hoverable`. Easing: `ease-out-quad`, `ease-out-cubic`, `ease-in-out-cubic`, `ease-out-quint`, `ease-md`. Animations: `animate-md-*` (see theme.css: fade, modal, sheet, scale, slide-left/right, accordion, toast, spinner, indeterminate, pulse). Palette: `bg-md-<color>-<50..900|a100..a700>`.
- **Focus**: `outline-none focus-visible:focus-ring` (a solid 2px ring in `--ring`). Do not use `focus-visible:outline-*` utilities directly (Tailwind v4 `outline-none` sets the style to none).
- **Dark mode**: tokens switch automatically under `.dark`; only add `dark:` variants for things tokens don't cover.
- **Motion**: CSS transitions/keyframes or the Web Animations API. No animation libraries. Respect reduced motion with `motion-reduce:` variants or `usePrefersReducedMotion()` from `@/hooks/use-media-query`.
- **Ripple**: `const startRipple = useRipple({ disabled })` from `@/hooks/use-ripple`, attached via `onPointerDown={composeEventHandlers(props.onPointerDown, startRipple)}`; the host needs `relative overflow-hidden`.
- **State**: support controlled and uncontrolled usage (`value`/`defaultValue`/`onValueChange`, `open`/`defaultOpen`/`onOpenChange`) with `useControllableState` from `@/hooks/use-controllable-state`, or the Radix primitive's own props.
- **Accessibility first**: prefer Radix primitives from the unified `radix-ui` package (`import { Dialog, Select, Tabs, Tooltip, Accordion, Checkbox, RadioGroup, Switch, Slider, DropdownMenu, Popover, Slot } from "radix-ui"`) for anything with complex keyboard/focus behavior; use `@floating-ui/react` for custom anchored overlays. Follow WAI-ARIA Authoring Practices for anything custom.
- **Security**: content props are `React.ReactNode`; never `dangerouslySetInnerHTML` (Materialize's Toast/Tooltip/Autocomplete had XSS CVEs from this).
- **SSR-safe**: no `window`/`document` access during render; use effects.
- **Icons**: use the inline SVG icons from `@/components/ui/icons` (add any missing Material icon there, using the official 24px Material Design path). Examples may use `<MaterialIcon name="..." />` (Material Icons font is loaded by the docs site).

## Commands

- Docs dev server: `npm run dev` (http://localhost:3000). Only one `next dev` can run per app.
- Typecheck: `npm run typecheck` (TypeScript 7).
- Registry + index: `npm run registry` (validates meta, regenerates `src/index.ts` and `apps/docs/public/r`).
- Library build: `npm run build:ui`. Full build: `npm run build`.
- E2E: `npx playwright test e2e/<name>.spec.ts --project=chromium` (all browsers: `npm run e2e`).
- Unit tests: `npm test` (vitest, `packages/ui/test`).
