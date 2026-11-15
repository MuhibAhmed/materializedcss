import type { Metadata } from "next";

import { CodeBlock } from "~/components/docs/code-block";
import { Callout, DocHeader, DocSection } from "~/components/docs/doc-parts";
import { ThemeCustomizer } from "~/components/theme-customizer";

export const metadata: Metadata = { title: "Theming" };

const TOKENS: Array<[string, string]> = [
  ["--background / --foreground", "Page background and default text."],
  ["--muted-foreground", "Secondary text: helper text, captions, icons."],
  ["--surface / --surface-2", "Cards, menus, sheets / modals and code blocks."],
  ["--surface-hover / --surface-active", "Hover and pressed state layers on surfaces."],
  ["--border / --input", "Dividers and outlines / form control underlines."],
  ["--primary (+ -foreground, -light, -dark)", "Brand color: navbars, footers, tabs, tap targets."],
  ["--secondary (+ -foreground, -hover, -focus, -light)", "Accent color: buttons, focused inputs, checkboxes, switches."],
  ["--success / --error / --warning", "Validation and status."],
  ["--link / --card-link", "Inline links / card action links."],
  ["--snackbar (+ -foreground, -action)", "Toasts and tooltips."],
  ["--overlay", "Modal and sidenav scrim."],
  ["--disabled / --disabled-foreground", "Disabled controls."],
  ["--ring", "Keyboard focus outline."],
  ["--radius", "Corner radius of buttons, cards, inputs (2px like Materialize)."],
];

export default function ThemingPage(): React.JSX.Element {
  return (
    <article data-doc-content>
      <DocHeader
        eyebrow="Getting Started"
        title="Theming"
        description="Every color is a CSS variable, so you can re-theme the whole library, including dark mode, without touching component code."
      />

      <DocSection title="Customizer">
        <p>Pick colors and a radius. The site re-themes live; copy the CSS into your global stylesheet.</p>
        <ThemeCustomizer className="mt-6" />
      </DocSection>

      <DocSection title="How it works">
        <p>
          <code>materializedcss/theme.css</code> declares semantic variables on <code>:root</code> and <code>.dark</code>,
          then maps them onto Tailwind with <code>@theme inline</code>. Utilities such as <code>bg-primary</code>,{" "}
          <code>text-muted-foreground</code> and <code>border-input</code> therefore follow whatever values you set.
        </p>
        <CodeBlock
          className="mt-4"
          lang="css"
          title="app/globals.css"
          code={`@import "tailwindcss";
@import "materializedcss/theme.css";

:root {
  --primary: #3949ab;          /* indigo darken-1 */
  --primary-foreground: #fff;
  --secondary: #e65100;        /* orange darken-4 */
  --secondary-foreground: #fff;
  --radius: 4px;
}`}
        />
      </DocSection>

      <DocSection title="Tokens">
        <div tabIndex={0} role="region" aria-label="Reference table" className="overflow-x-auto rounded-md border border-border outline-none focus-visible:focus-ring">
          <table className="w-full text-left text-sm">
            <tbody>
              {TOKENS.map(([token, description]) => (
                <tr key={token} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] text-secondary">{token}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection title="Classic Materialize colors">
        <p>
          Materialize&apos;s original coral red <code>#ee6e73</code> and teal <code>#26a69a</code> don&apos;t reach WCAG AA
          contrast with white text (about 3:1). The default theme deepens them slightly (<code>#cf3b41</code> and{" "}
          <code>#007f71</code>, both above 4.5:1 with white text and on every surface). If you need the exact original look, add the <code>theme-classic</code>{" "}
          class to <code>&lt;html&gt;</code>:
        </p>
        <CodeBlock className="mt-4" code={`<html lang="en" className="theme-classic">`} />
        <Callout tone="warning" title="Accessibility">
          The classic colors fail WCAG AA for small white text. Prefer the default theme for production apps.
        </Callout>
      </DocSection>

      <DocSection title="Elevation, motion and type">
        <p>
          The theme also adds the z-depth shadows (<code>shadow-z1</code> … <code>shadow-z5</code>), Materialize easing
          curves (<code>ease-out-quad</code>, <code>ease-out-cubic</code>, …), heading sizes (<code>text-h1</code> …{" "}
          <code>text-h6</code>), the full palette (<code>bg-md-teal-500</code>) and the <code>animate-md-*</code> keyframes
          used by the components. See <a href="/docs/shadows">Shadows</a>, <a href="/docs/typography">Typography</a> and{" "}
          <a href="/docs/colors">Colors</a>.
        </p>
      </DocSection>
    </article>
  );
}
