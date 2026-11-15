import Link from "next/link";

import {
  Footer,
  FooterContent,
  FooterCopyright,
  FooterLink,
  FooterLinks,
  FooterSection,
  FooterText,
  FooterTitle,
} from "@/components/ui/footer";
import { siteConfig } from "~/lib/site";

export interface HomeFooterProps {
  /** Docs page of the first component in the sidebar. */
  componentsHref: string;
  /** Number of documented components. */
  componentCount: number;
}

/** Materialize page footer with credits and the main docs links. */
export function HomeFooter({ componentsHref, componentCount }: HomeFooterProps): React.JSX.Element {
  const links = [
    { label: "Docs", href: "/docs" },
    { label: `Components (${componentCount})`, href: componentsHref },
    { label: "CLI", href: "/docs/cli" },
    { label: "Theming", href: "/docs/theming" },
  ];
  return (
    <Footer className="dark:bg-[#2a1f20] dark:text-white">
      <FooterContent>
        <FooterSection>
          <FooterTitle>{siteConfig.name}</FooterTitle>
          <FooterText className="max-w-xl">
            Material Design components for React 19, Tailwind CSS v4 and TypeScript. Based on{" "}
            <FooterLink href="https://materializecss.com" className="underline">
              Materialize
            </FooterLink>{" "}
            by Alvin Wang, Alan Chang, Alex Mark and Kevin Louie, released under the MIT License.
          </FooterText>
        </FooterSection>
        <FooterSection>
          <FooterTitle>Links</FooterTitle>
          <nav aria-label="Footer">
            <FooterLinks>
              {links.map((link) => (
                <li key={link.href}>
                  <FooterLink asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </FooterLink>
                </li>
              ))}
            </FooterLinks>
          </nav>
        </FooterSection>
      </FooterContent>
      <FooterCopyright className="dark:text-white/90">
        <span>MIT License. Not affiliated with Google.</span>
        <span>Based on Materialize, &copy; 2014–2018 Materialize contributors</span>
      </FooterCopyright>
    </Footer>
  );
}
