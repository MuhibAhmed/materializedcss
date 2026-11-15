export interface NavItem {
  title: string;
  href: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const siteConfig = {
  name: "materializedcss",
  description:
    "Materialize's Material Design components, rebuilt for React 19, Tailwind CSS v4 and TypeScript. Copy them into your app with a CLI, or install them from npm.",
  url: "https://muhibahmed.github.io/materializedcss",
  registryUrl: "https://muhibahmed.github.io/materializedcss/r",
} as const;

/** Order of component categories in the sidebar. Unknown categories go last. */
export const CATEGORY_ORDER: readonly string[] = [
  "Foundations",
  "Actions",
  "Forms",
  "Data Display",
  "Navigation",
  "Overlays",
  "Feedback",
  "Layout",
  "Media & Motion",
];

export const gettingStartedNav: NavSection = {
  title: "Getting Started",
  items: [
    { title: "Introduction", href: "/docs" },
    { title: "Installation", href: "/docs/installation" },
    { title: "CLI", href: "/docs/cli" },
    { title: "Theming", href: "/docs/theming" },
    { title: "Dark mode", href: "/docs/dark-mode" },
  ],
};

export const designNav: NavSection = {
  title: "Design System",
  items: [
    { title: "Colors", href: "/docs/colors" },
    { title: "Typography", href: "/docs/typography" },
    { title: "Shadows", href: "/docs/shadows" },
    { title: "Grid & helpers", href: "/docs/grid" },
  ],
};

/** Full-page demos built from the components (header and mobile menu only, not the docs sidebar). */
export const examplesNav: NavSection = {
  title: "Examples",
  items: [{ title: "Store", href: "/examples/store" }],
};
