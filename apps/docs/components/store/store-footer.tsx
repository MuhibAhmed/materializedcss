"use client";

import * as React from "react";
import Link from "next/link";

import { CATEGORIES, type CategoryId } from "~/components/store/data";
import { Button } from "@/components/ui/button";
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
import { MaterialIcon } from "@/components/ui/icons";
import { NativeSelect } from "@/components/ui/select";
import { TextField } from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";

/** Field tokens re-pointed at white so the form controls read on the colored footer. */
const onColor =
  "[--foreground:#fff] [--muted-foreground:#fff] [--input:rgb(255_255_255/0.7)] [--secondary:#fff] [--error:#ffcdd2]";

/** The native popup keeps light colors; the white field text would vanish on it. */
const optionColors = "[&_option]:bg-white [&_option]:text-md-grey-900";

export function StoreFooter({ onCategory }: { onCategory: (category: CategoryId | "all") => void }): React.JSX.Element {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | undefined>(undefined);

  const subscribe = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }
    setError(undefined);
    setEmail("");
    toast({ content: "Subscribed. Watch your inbox for 10% off.", duration: 5000 });
  };

  return (
    <Footer className="mt-0 dark:bg-[#2a1f20] dark:text-white">
      <FooterContent className="max-w-[1400px] gap-y-2 py-6 md:grid-cols-[1.4fr_1fr_1fr] lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <FooterSection>
          <FooterTitle className="flex items-center gap-2">
            <MaterialIcon name="send" className="-rotate-[25deg]" />
            paperplane
          </FooterTitle>
          <FooterText className="max-w-sm">
            Well made things for everyday trips, shipped from a small studio in Lisbon. This store is a demo built with
            materializedcss components.
          </FooterText>
          <form onSubmit={subscribe} noValidate className={`mt-2 flex max-w-sm items-start gap-3 ${onColor}`} aria-label="Newsletter">
            <TextField
              label="Email for deals"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(undefined);
              }}
              error={error}
              className="flex-1"
            />
            <Button type="submit" className="mt-5 shrink-0 bg-white text-primary hover:bg-white/90 dark:text-[#2a1f20]">
              Subscribe
            </Button>
          </form>
        </FooterSection>
        <FooterSection>
          <FooterTitle as="h3" className="text-lg">
            Shop
          </FooterTitle>
          <nav aria-label="Shop categories">
            <FooterLinks>
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <FooterLink
                    href="#shop"
                    onClick={(event) => {
                      event.preventDefault();
                      onCategory(category.id);
                    }}
                  >
                    {category.label}
                  </FooterLink>
                </li>
              ))}
            </FooterLinks>
          </nav>
        </FooterSection>
        <FooterSection>
          <FooterTitle as="h3" className="text-lg">
            Help
          </FooterTitle>
          <nav aria-label="Help">
            <FooterLinks>
              <li>
                <FooterLink href="#care-shipping">Shipping</FooterLink>
              </li>
              <li>
                <FooterLink href="#care-returns">Returns</FooterLink>
              </li>
              <li>
                <FooterLink href="#care-warranty">Warranty</FooterLink>
              </li>
              <li>
                <FooterLink asChild>
                  <Link href="/docs">materializedcss docs</Link>
                </FooterLink>
              </li>
            </FooterLinks>
          </nav>
        </FooterSection>
        <FooterSection className={onColor}>
          <FooterTitle as="h3" className="text-lg">
            Region
          </FooterTitle>
          <NativeSelect label="Ship to" defaultValue="PT" className="mt-2" selectClassName={optionColors}>
            <option value="PT">Portugal</option>
            <option value="ES">Spain</option>
            <option value="FR">France</option>
            <option value="DE">Germany</option>
            <option value="GB">United Kingdom</option>
            <option value="US">United States</option>
          </NativeSelect>
          <NativeSelect label="Currency" defaultValue="USD" selectClassName={optionColors}>
            <option value="USD">USD $</option>
            <option value="EUR">EUR €</option>
            <option value="GBP">GBP £</option>
          </NativeSelect>
        </FooterSection>
      </FooterContent>
      <FooterCopyright className="bg-black/20 text-white dark:bg-black/25">
        <span>© 2026 Paper Plane Supply Co. A demo store, nothing is for sale.</span>
        <span className="flex gap-4">
          <FooterLink href="#top">Back to top</FooterLink>
          <FooterLink asChild>
            <Link href="/">materializedcss</Link>
          </FooterLink>
        </span>
      </FooterCopyright>
    </Footer>
  );
}
