"use client";

import * as React from "react";

import { Card, type CardProps } from "@/components/ui/card";
import { useControllableState } from "@/hooks/use-controllable-state";
import { CloseIcon } from "@/components/ui/icons";
import { cn, composeEventHandlers } from "@/lib/utils";

interface CardRevealContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  panelId: string;
  titleId: string;
  /** Element to refocus when the panel closes (the trigger that opened it). */
  returnFocusRef: React.RefObject<HTMLElement | null>;
  /** True when the last change came from the user (so focus should move). */
  userActionRef: React.RefObject<boolean>;
}

const CardRevealContext = React.createContext<CardRevealContextValue | null>(null);

function useCardRevealContext(component: string): CardRevealContextValue {
  const context = React.useContext(CardRevealContext);
  if (!context) throw new Error(`<${component}> must be used inside <CardRevealRoot>.`);
  return context;
}

export interface CardRevealRootProps extends CardProps {
  /** Controlled open state of the reveal panel. */
  open?: boolean | undefined;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean | undefined;
  /** Called when the panel opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}

/**
 * A `Card` with a hidden panel that slides up over it (Materialize `.card-reveal`).
 * Combine with `CardRevealTrigger` and `CardReveal`.
 */
export function CardRevealRoot({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...props
}: CardRevealRootProps): React.JSX.Element {
  const [open, setOpenState] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const id = React.useId();
  const returnFocusRef = React.useRef<HTMLElement | null>(null);
  const userActionRef = React.useRef(false);

  const setOpen = React.useCallback(
    (next: boolean) => {
      userActionRef.current = true;
      setOpenState(next);
    },
    [setOpenState],
  );

  const context = React.useMemo<CardRevealContextValue>(
    () => ({ open, setOpen, panelId: `${id}-panel`, titleId: `${id}-title`, returnFocusRef, userActionRef }),
    [open, setOpen, id],
  );

  return (
    <CardRevealContext.Provider value={context}>
      <Card data-state={open ? "open" : "closed"} className={cn("overflow-hidden", className)} {...props}>
        {children}
      </Card>
    </CardRevealContext.Provider>
  );
}

export type CardRevealTriggerProps = React.ComponentProps<"button">;

/**
 * Opens the reveal panel (Materialize `.activator`). Usually wraps the card
 * title and a "more" icon, or the card image (then give it an `aria-label`).
 */
export function CardRevealTrigger({ className, onClick, type, ...props }: CardRevealTriggerProps): React.JSX.Element {
  const { open, setOpen, panelId, returnFocusRef } = useCardRevealContext("CardRevealTrigger");
  return (
    <button
      data-slot="card-reveal-trigger"
      type={type ?? "button"}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={composeEventHandlers(onClick, (event: React.MouseEvent<HTMLButtonElement>) => {
        returnFocusRef.current = event.currentTarget;
        setOpen(!open);
      })}
      className={cn(
        "inline-flex w-full cursor-pointer items-center justify-between gap-2 rounded-ui bg-transparent p-0 text-left font-[inherit] text-inherit outline-none focus-visible:focus-ring",
        "[&>img]:block [&>img]:w-full",
        className,
      )}
      {...props}
    />
  );
}

export interface CardRevealProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** Heading shown at the top of the panel, next to the close button. */
  title?: React.ReactNode;
  /** Accessible label of the close button. */
  closeLabel?: string;
}

/**
 * The panel that slides up over the card. Escape or the close button hides it
 * and returns focus to the trigger; opening it moves focus to the close button.
 */
export function CardReveal({
  title,
  closeLabel = "Close",
  className,
  children,
  onKeyDown,
  ...props
}: CardRevealProps): React.JSX.Element {
  const { open, setOpen, panelId, titleId, returnFocusRef, userActionRef } = useCardRevealContext("CardReveal");
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!userActionRef.current) return;
    userActionRef.current = false;
    if (open) {
      (closeRef.current ?? panelRef.current)?.focus({ preventScroll: true });
    } else if (panelRef.current?.contains(document.activeElement) || document.activeElement === document.body) {
      returnFocusRef.current?.focus({ preventScroll: true });
    }
  }, [open, userActionRef, returnFocusRef]);

  const close = (): void => setOpen(false);

  return (
    <div
      ref={panelRef}
      id={panelId}
      data-slot="card-reveal"
      data-state={open ? "open" : "closed"}
      role="region"
      aria-labelledby={title ? titleId : undefined}
      tabIndex={-1}
      inert={!open}
      onKeyDown={composeEventHandlers(onKeyDown, (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      })}
      className={cn(
        "absolute inset-0 z-[3] overflow-y-auto bg-surface p-6 text-foreground outline-none",
        "duration-300 ease-in-out-cubic motion-reduce:transition-none",
        // Opening: visibility flips at once so the close button can take focus.
        // Closing: visibility is transitioned so the panel stays visible while it slides away.
        open ? "visible translate-y-0 transition-[translate]" : "invisible translate-y-full transition-[translate,visibility]",
        className,
      )}
      {...props}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        {title ? (
          <h3 id={titleId} data-slot="card-title" className="text-2xl font-light leading-8">
            {title}
          </h3>
        ) : (
          <span />
        )}
        <button
          ref={closeRef}
          type="button"
          aria-label={closeLabel}
          onClick={close}
          className="-mr-2 -mt-0.5 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-2xl text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:focus-ring"
        >
          <CloseIcon />
        </button>
      </div>
      {children}
    </div>
  );
}
