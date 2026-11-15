import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";

import { ThemeProvider } from "~/components/theme-provider";
import { siteConfig } from "~/lib/site";

import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${siteConfig.name}: Material Design for React & Tailwind`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ee6e73" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning className={`${roboto.variable} ${robotoMono.variable}`}>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        {/* Material Icons font: used by examples via <MaterialIcon name="…" /> */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" precedence="default" />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
