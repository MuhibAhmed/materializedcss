# materializedcss

The [Materialize](https://github.com/Dogfalo/materialize) design, rebuilt for **React 19**, **Tailwind CSS v4** and **TypeScript**. It includes ripples, z-depth shadows, floating labels and the Materialize palette, without jQuery. It is accessible and themeable, and has dark mode built in.

## Copy the components into your app

```bash
npx materializedcss init
npx materializedcss add button card text-field toast
```

```tsx
import { Button } from "@/components/ui/button";

export default function Page() {
  return <Button>Hello Material</Button>;
}
```

The CLI works with Next.js, Vite, React Router, Astro and custom setups. It detects your import aliases and package manager. Run `npx materializedcss --help` to see every command.

## Or import from the package

```css
@import "tailwindcss";
@import "materializedcss/styles.css";
```

```tsx
import { Button, Card } from "materializedcss";
import { Modal } from "materializedcss/modal";
```

Requires React 19 and Tailwind CSS v4.

## Credits

The design comes from Materialize by [Alvin Wang (@Dogfalo)](https://github.com/Dogfalo), Alan Chang, Alex Mark and Kevin Louie. materializedcss is an independent reimplementation released under the MIT license.
