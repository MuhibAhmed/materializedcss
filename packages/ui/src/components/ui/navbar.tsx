"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { useControllableState } from "@/hooks/use-controllable-state";
import { CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";
import { cn, composeEventHandlers } from "@/lib/utils";

// Focus indicator that stays visible on the colored bar: an inset ring in the text color.
const navFocus = "outline-none focus-visible:focus-ring focus-visible:outline-current! focus-visible:outline-offset-[-3px]!";

export interface NavbarProps extends React.ComponentProps<"header"> {
  /** Stick to the top of the scroll container while scrolling (Materialize `.navbar-fixed`). */
  fixed?: boolean;
}

/**
 * Top app bar (Materialize `nav`): 56px on mobile, 64px from 601px, primary
 * background with z-depth-1. Compose `NavbarContent`, `NavbarBrand`,
 * `NavbarNav` and optionally `NavbarExtended`.
 */
export function Navbar({ className, fixed = false, ...props }: NavbarProps): React.JSX.Element {
  return (
    <header
      data-slot="navbar"
      data-fixed={fixed ? "" : undefined}
      className={cn(
        "relative w-full bg-primary text-primary-foreground shadow-z1",
        fixed && "sticky top-0 z-[997]",
        className,
      )}
      {...props}
    />
  );
}

/** The main 56/64px row (Materialize `.nav-wrapper`). */
export function NavbarContent({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="navbar-content"
      className={cn(
        "relative flex h-14 min-w-0 items-center px-2 sm:h-16 sm:px-4 [&_.material-icons]:text-2xl [&_svg]:size-6",
        className,
      )}
      {...props}
    />
  );
}

export interface NavbarBrandProps extends React.ComponentProps<"a"> {
  /** `left` (default), `center` (absolutely centered) or `right` (pushed to the end). */
  position?: "left" | "center" | "right";
  /** Render the child element (e.g. Next.js `Link`) instead of an `<a>`. */
  asChild?: boolean;
}

/** Logo or product name (Materialize `.brand-logo`), 2.1rem. */
export function NavbarBrand({ className, position = "left", asChild = false, ...props }: NavbarBrandProps): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "a";
  return (
    <Comp
      data-slot="navbar-brand"
      data-position={position}
      className={cn(
        "inline-flex shrink-0 items-center gap-[15px] whitespace-nowrap rounded-ui px-2 text-[2.1rem] leading-none text-inherit no-underline",
        "[&_.material-icons]:text-[2.1rem]! [&_svg]:size-[2.1rem]!",
        navFocus,
        position === "center" && "absolute left-1/2 -translate-x-1/2",
        position === "right" && "order-last ml-auto",
        className,
      )}
      {...props}
    />
  );
}

export interface NavbarNavProps extends React.ComponentProps<"nav"> {
  /** Push the links to the end of the bar (default) or keep them at the start. */
  align?: "start" | "end";
  /** Accessible name of the navigation landmark, e.g. "Main". */
  "aria-label"?: string;
}

/**
 * Navigation links (Materialize `nav ul`). Renders `<nav><ul>`; put `NavbarItem`s inside.
 * On narrow screens links that do not fit scroll horizontally instead of being clipped.
 */
export function NavbarNav({ className, align = "end", children, ...props }: NavbarNavProps): React.JSX.Element {
  return (
    <nav
      data-slot="navbar-nav"
      className={cn(
        "flex h-full min-w-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        align === "end" ? "ml-auto" : "mr-auto",
        className,
      )}
      {...props}
    >
      <ul className="m-0 flex h-full list-none items-stretch p-0">{children}</ul>
    </nav>
  );
}

/** One entry of `NavbarNav`. */
export function NavbarItem({ className, ...props }: React.ComponentProps<"li">): React.JSX.Element {
  return (
    <li
      data-slot="navbar-item"
      className={cn("flex list-none items-center [&>[data-slot=button]]:mx-[15px]", className)}
      {...props}
    />
  );
}

export interface NavbarLinkProps extends React.ComponentProps<"a"> {
  /** The current page: darker background and `aria-current="page"`. */
  active?: boolean;
  /** Render the child element (e.g. Next.js `Link`) instead of an `<a>`. */
  asChild?: boolean;
}

/** Full-height link with a hover tint (Materialize `nav ul a`). */
export function NavbarLink({ className, active = false, asChild = false, ...props }: NavbarLinkProps): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "a";
  return (
    <Comp
      data-slot="navbar-link"
      data-active={active ? "" : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-full cursor-pointer items-center gap-2 px-[15px] text-base text-inherit no-underline transition-colors duration-300 hover:bg-black/10",
        active && "bg-black/10",
        navFocus,
        className,
      )}
      {...props}
    />
  );
}

export interface NavbarTitleProps extends React.ComponentProps<"h1"> {
  /** Element to render. Use the heading level that fits your page outline. */
  as?: "h1" | "h2" | "h3" | "div" | "span";
}

/** Large page title inside `NavbarExtended` (Materialize `.nav-title`, 32px). */
export function NavbarTitle({ className, as: Comp = "h1", ...props }: NavbarTitleProps): React.JSX.Element {
  return (
    <Comp
      data-slot="navbar-title"
      className={cn("m-0 inline-block py-7 text-[32px] font-normal leading-none", className)}
      {...props}
    />
  );
}

/** Second row of an extended navbar: a title, tabs or a floating action button (Materialize `.nav-content`). */
export function NavbarExtended({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return <div data-slot="navbar-extended" className={cn("relative px-4 leading-normal sm:px-6", className)} {...props} />;
}

export interface NavbarMenuButtonProps extends React.ComponentProps<"button"> {
  /** Accessible name. */
  "aria-label"?: string;
}

/**
 * Hamburger button that opens a side navigation (Materialize `.sidenav-trigger`).
 * Pass `aria-expanded` and `aria-controls` from your Sidenav. Hide it on large
 * screens with `className="lg:hidden"` if the links are visible there.
 */
export function NavbarMenuButton({
  className,
  "aria-label": ariaLabel = "Open navigation menu",
  type,
  children,
  ...props
}: NavbarMenuButtonProps): React.JSX.Element {
  return (
    <button
      data-slot="navbar-menu-button"
      type={type ?? "button"}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-inherit transition-colors duration-300 hover:bg-black/10",
        navFocus,
        className,
      )}
      {...props}
    >
      {children ?? <MenuIcon />}
    </button>
  );
}

export interface NavbarSearchProps extends Omit<React.ComponentProps<"form">, "onSubmit" | "defaultValue"> {
  /** Controlled query. */
  value?: string | undefined;
  /** Initial query when uncontrolled. */
  defaultValue?: string | undefined;
  /** Called on every keystroke and when the query is cleared. */
  onValueChange?: ((value: string) => void) | undefined;
  /** Called with the query when the form is submitted (Enter). */
  onSearch?: ((value: string) => void) | undefined;
  /** Called when the close button (or Escape) is used on an empty field: hide the search bar here. */
  onClose?: (() => void) | undefined;
  /** Accessible label of the input (visually hidden). */
  label?: string;
  /** Show the placeholder text inside the input. */
  placeholder?: string;
  /** Accessible label of the clear/close button. */
  clearLabel?: string;
  /** Props passed to the `<input>`. */
  inputProps?: Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "type">;
}

/**
 * Full-width search field for the navbar (Materialize `nav form .input-field`).
 * Turns white when focused. The close button clears the query, and on an
 * empty field calls `onClose`.
 */
export function NavbarSearch({
  className,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSearch,
  onClose,
  label = "Search",
  placeholder,
  clearLabel = "Clear search",
  inputProps,
  ...props
}: NavbarSearchProps): React.JSX.Element {
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange: onValueChange });
  const inputRef = React.useRef<HTMLInputElement>(null);
  const id = React.useId();
  const inputId = inputProps?.id ?? `${id}-search`;

  const clear = (): void => {
    if (value) {
      setValue("");
      inputRef.current?.focus();
    } else {
      onClose?.();
    }
  };

  return (
    <form
      data-slot="navbar-search"
      role="search"
      className={cn("relative flex h-full w-full items-center", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch?.(value);
      }}
      {...props}
    >
      <input
        {...inputProps}
        ref={inputRef}
        id={inputId}
        type="search"
        value={value}
        placeholder={placeholder}
        autoComplete={inputProps?.autoComplete ?? "off"}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={composeEventHandlers(inputProps?.onKeyDown, (event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Escape") {
            event.preventDefault();
            clear();
          }
        })}
        className={cn(
          "peer h-full w-full min-w-0 border-0 bg-transparent pr-16 pl-16 text-[1.2rem] text-inherit outline-none transition-colors duration-300",
          "placeholder:text-current placeholder:opacity-80 focus:bg-surface focus:text-foreground",
          "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
          inputProps?.className,
        )}
      />
      <label
        htmlFor={inputId}
        className="pointer-events-none absolute left-4 top-1/2 inline-flex -translate-y-1/2 text-inherit opacity-80 transition-colors duration-300 peer-focus:text-foreground peer-focus:opacity-100 [&_svg]:size-6"
      >
        <SearchIcon />
        <span className="sr-only">{label}</span>
      </label>
      <button
        type="button"
        aria-label={clearLabel}
        onClick={clear}
        className={cn(
          "absolute right-2 top-1/2 inline-flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-transparent text-inherit transition-colors duration-300 hover:bg-black/10 peer-focus:text-foreground [&_svg]:size-7",
          navFocus,
        )}
      >
        <CloseIcon />
      </button>
    </form>
  );
}
