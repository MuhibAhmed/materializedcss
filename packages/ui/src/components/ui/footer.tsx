import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/** Page footer (Materialize `footer.page-footer`): primary background with light text. */
export function Footer({ className, ...props }: React.ComponentProps<"footer">): React.JSX.Element {
  return (
    <footer
      data-slot="footer"
      className={cn("w-full bg-primary pt-5 text-primary-foreground", className)}
      {...props}
    />
  );
}

/** Centered container (Materialize `.container`) laying out footer columns in a responsive grid. */
export function FooterContent({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="footer-content"
      className={cn("mx-auto grid w-[90%] max-w-[1280px] gap-x-8 gap-y-4 pb-5 md:grid-cols-[2fr_1fr]", className)}
      {...props}
    />
  );
}

/** A column of the footer. */
export function FooterSection({ className, ...props }: React.ComponentProps<"section">): React.JSX.Element {
  return <section data-slot="footer-section" className={cn("min-w-0", className)} {...props} />;
}

export interface FooterTitleProps extends React.ComponentProps<"h2"> {
  /** Heading element. The default `h2` is styled like Materialize's footer `h5`. */
  as?: "h2" | "h3" | "h4" | "h5" | "h6" | "p";
}

/** Column heading (Materialize footer `h5`). */
export function FooterTitle({ className, as: Comp = "h2", ...props }: FooterTitleProps): React.JSX.Element {
  return (
    <Comp
      data-slot="footer-title"
      className={cn("mt-[1.0933rem] mb-[0.656rem] text-h5 font-normal leading-[1.1]", className)}
      {...props}
    />
  );
}

/** Body text in a footer column. */
export function FooterText({ className, ...props }: React.ComponentProps<"p">): React.JSX.Element {
  return <p data-slot="footer-text" className={cn("m-0 font-light leading-normal", className)} {...props} />;
}

/** List of footer links. Wrap it in `<nav aria-label>` if it is a navigation menu. */
export function FooterLinks({ className, ...props }: React.ComponentProps<"ul">): React.JSX.Element {
  return <ul data-slot="footer-links" className={cn("m-0 list-none space-y-1 p-0 [&>li]:list-none", className)} {...props} />;
}

export interface FooterLinkProps extends React.ComponentProps<"a"> {
  /** Render the child element (e.g. Next.js `Link`) instead of an `<a>`. */
  asChild?: boolean;
}

/** Light link for use on the footer background. */
export function FooterLink({ className, asChild = false, ...props }: FooterLinkProps): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "a";
  return (
    <Comp
      data-slot="footer-link"
      className={cn(
        "rounded-ui text-inherit no-underline underline-offset-4 outline-none hover:underline focus-visible:focus-ring focus-visible:outline-current!",
        className,
      )}
      {...props}
    />
  );
}

/** Bottom strip with the copyright notice (Materialize `.footer-copyright`). */
export function FooterCopyright({ className, children, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="footer-copyright"
      className={cn("flex min-h-[50px] items-center bg-black/15 py-2.5 font-light text-primary-foreground/90 dark:bg-white/15", className)}
      {...props}
    >
      <div className="mx-auto flex w-[90%] max-w-[1280px] flex-wrap items-center justify-between gap-x-6 gap-y-1">{children}</div>
    </div>
  );
}
