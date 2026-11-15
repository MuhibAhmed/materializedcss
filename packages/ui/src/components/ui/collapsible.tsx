"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive, Collapsible as CollapsiblePrimitive } from "radix-ui";

import { ExpandMoreIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type CollapsibleVariant = "default" | "popout";

const CollapsibleVariantContext = React.createContext<CollapsibleVariant>("default");

interface CollapsibleOwnProps {
  /** `default` is a bordered, elevated list. `popout` floats items and lifts the open one (Materialize `.popout`). */
  variant?: CollapsibleVariant;
}

export type CollapsibleSingleProps = Omit<
  React.ComponentProps<typeof AccordionPrimitive.Root> & { type: "single" },
  "type" | "collapsible"
> &
  CollapsibleOwnProps & {
    /** `single` (accordion, default): opening an item closes the others. */
    type?: "single";
    /** Allow closing the open item so none is open. Defaults to `true` like Materialize. */
    collapsible?: boolean;
    /** Controlled open item (`""` for none). */
    value?: string;
    /** Initially open item. */
    defaultValue?: string;
    /** Called with the open item, or `""` when all are closed. */
    onValueChange?: (value: string) => void;
  };

export type CollapsibleMultipleProps = Omit<React.ComponentProps<typeof AccordionPrimitive.Root> & { type: "multiple" }, "type"> &
  CollapsibleOwnProps & {
    /** `multiple` (Materialize "expandable"): any number of items can be open. */
    type: "multiple";
    /** Controlled open items. */
    value?: string[];
    /** Initially open items. */
    defaultValue?: string[];
    /** Called with the open items. */
    onValueChange?: (value: string[]) => void;
  };

export type CollapsibleProps = CollapsibleSingleProps | CollapsibleMultipleProps;

const rootClasses: Record<CollapsibleVariant, string> = {
  default: "my-2 border-x border-t border-border bg-surface shadow-z1",
  popout: "my-2",
};

/**
 * Materialize collapsible: a list of expandable sections, as an accordion
 * (`type="single"`, default) or expandable list (`type="multiple"`). Built on
 * Radix Accordion for button headers with `aria-expanded`/`aria-controls` and
 * arrow-key navigation between headers.
 */
export function Collapsible(props: CollapsibleProps): React.JSX.Element {
  const variant = props.variant ?? "default";
  const content = (children: React.ReactNode): React.JSX.Element => (
    <CollapsibleVariantContext.Provider value={variant}>{children}</CollapsibleVariantContext.Provider>
  );

  if (props.type === "multiple") {
    const { variant: _variant, className, children, type: _type, ...rest } = props;
    return content(
      <AccordionPrimitive.Root
        data-slot="collapsible"
        data-variant={variant}
        type="multiple"
        className={cn(rootClasses[variant], className)}
        {...rest}
      >
        {children}
      </AccordionPrimitive.Root>,
    );
  }

  const { variant: _variant, className, children, type: _type, collapsible = true, ...rest } = props;
  return content(
    <AccordionPrimitive.Root
      data-slot="collapsible"
      data-variant={variant}
      type="single"
      collapsible={collapsible}
      className={cn(rootClasses[variant], className)}
      {...rest}
    >
      {children}
    </AccordionPrimitive.Root>,
  );
}

export interface CollapsibleItemProps extends React.ComponentProps<typeof AccordionPrimitive.Item> {}

/** One section: a header and its body. */
export function CollapsibleItem({ className, ...props }: CollapsibleItemProps): React.JSX.Element {
  const variant = React.useContext(CollapsibleVariantContext);
  return (
    <AccordionPrimitive.Item
      data-slot="collapsible-item"
      className={cn(
        variant === "popout" &&
          "mx-6 bg-surface shadow-[0_2px_5px_0_rgba(0,0,0,0.16),0_2px_10px_0_rgba(0,0,0,0.12)] transition-[margin,box-shadow] duration-[350ms] ease-out-quad data-[state=open]:mx-0 data-[state=open]:my-4 data-[state=open]:shadow-[0_5px_11px_0_rgba(0,0,0,0.18),0_4px_15px_0_rgba(0,0,0,0.15)] motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export interface CollapsibleHeaderProps extends React.ComponentProps<typeof AccordionPrimitive.Trigger> {
  /** Leading icon (Materialize `.collapsible-header i`): 2rem wide, 1.6rem, 1rem gap. */
  icon?: React.ReactNode;
  /** Show the rotating expand chevron at the end. */
  chevron?: boolean;
  /** Heading level of the wrapping element. Use the level that fits your document outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

/** The clickable header: a `<button>` inside a heading. */
export function CollapsibleHeader({
  className,
  icon,
  chevron = true,
  headingLevel = 3,
  children,
  ...props
}: CollapsibleHeaderProps): React.JSX.Element {
  const Heading = `h${headingLevel}` as const;
  return (
    <AccordionPrimitive.Header asChild>
      <Heading data-slot="collapsible-heading" className="m-0 text-base font-normal">
        <AccordionPrimitive.Trigger
          data-slot="collapsible-header"
          className={cn(
            "group/collapsible-header flex w-full cursor-pointer items-center border-b border-border bg-surface p-4 text-left text-base leading-normal text-foreground [-webkit-tap-highlight-color:transparent]",
            "transition-colors duration-200 hover:bg-surface-hover",
            "outline-none focus-visible:bg-surface-active focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]",
            "disabled:cursor-default disabled:text-disabled-foreground",
            className,
          )}
          {...props}
        >
          {icon ? (
            <span
              data-slot="collapsible-icon"
              aria-hidden="true"
              className="mr-4 inline-flex w-8 shrink-0 items-center justify-center text-[1.6rem] [&_.material-icons]:text-[1.6rem] [&_svg]:size-[1.6rem]"
            >
              {icon}
            </span>
          ) : null}
          <span className="min-w-0 flex-1">{children}</span>
          {chevron ? (
            <ExpandMoreIcon
              data-slot="collapsible-chevron"
              className="ml-4 size-6 shrink-0 text-muted-foreground transition-transform duration-300 ease-in-out-cubic group-data-[state=open]/collapsible-header:rotate-180 motion-reduce:transition-none"
            />
          ) : null}
        </AccordionPrimitive.Trigger>
      </Heading>
    </AccordionPrimitive.Header>
  );
}

export interface CollapsibleBodyProps extends React.ComponentProps<typeof AccordionPrimitive.Content> {
  /** Classes for the inner padded box (the outer element animates its height). */
  innerClassName?: string;
}

/** The expandable body: 2rem padding, bottom border, 300ms height animation. */
export function CollapsibleBody({ className, innerClassName, children, ...props }: CollapsibleBodyProps): React.JSX.Element {
  return (
    <AccordionPrimitive.Content
      data-slot="collapsible-body"
      className={cn(
        "overflow-hidden border-b border-border text-foreground data-[state=closed]:animate-md-accordion-up data-[state=open]:animate-md-accordion-down motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none",
        className,
      )}
      {...props}
    >
      <div className={cn("p-8", innerClassName)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export interface CollapsibleSectionProps extends React.ComponentProps<typeof CollapsiblePrimitive.Root> {}

/**
 * A single show/hide disclosure (Radix Collapsible) for when you don't need a
 * list of sections. Supports `open`/`defaultOpen`/`onOpenChange`.
 */
export function CollapsibleSection(props: CollapsibleSectionProps): React.JSX.Element {
  return <CollapsiblePrimitive.Root data-slot="collapsible-section" {...props} />;
}

export interface CollapsibleSectionTriggerProps extends React.ComponentProps<typeof CollapsiblePrimitive.Trigger> {}

/** The button that toggles a `CollapsibleSection`. Use `asChild` to render your own button. */
export function CollapsibleSectionTrigger(props: CollapsibleSectionTriggerProps): React.JSX.Element {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-section-trigger" {...props} />;
}

export interface CollapsibleSectionContentProps extends React.ComponentProps<typeof CollapsiblePrimitive.Content> {}

/** The content of a `CollapsibleSection`, animated with the same 300ms height transition. */
export function CollapsibleSectionContent({ className, ...props }: CollapsibleSectionContentProps): React.JSX.Element {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-section-content"
      className={cn(
        "overflow-hidden [--radix-accordion-content-height:var(--radix-collapsible-content-height)] data-[state=closed]:animate-md-accordion-up data-[state=open]:animate-md-accordion-down motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none",
        className,
      )}
      {...props}
    />
  );
}
