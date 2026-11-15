"use client";

import * as React from "react";
import { autoUpdate, flip, FloatingPortal, offset, shift, size, useFloating } from "@floating-ui/react";

import { floatedLabelClearance, TextField, type TextFieldProps } from "@/components/ui/text-field";
import { cn, composeEventHandlers } from "@/lib/utils";

/* -------------------------------------------------------------------------------------------------
 * Data
 * -----------------------------------------------------------------------------------------------*/

/** One suggestion. */
export interface AutocompleteOption {
  /** Text inserted into the input when the option is chosen. */
  value: string;
  /** Text shown in the list. Defaults to `value`. */
  label?: string;
  /** Optional image URL shown as a small circle (Materialize `data` map values). */
  image?: string;
  /** Alt text for the image. Decorative (empty) by default. */
  imageAlt?: string;
  /** Not selectable. */
  disabled?: boolean;
}

/** Materialize-style data map: `{ "Apple": null, "Google": "https://.../google.png" }`. */
export type AutocompleteData = Record<string, string | null>;

/** Loads suggestions for a query. Abort work when `signal` fires (a newer query superseded it). */
export type AutocompleteLoader = (query: string, signal: AbortSignal) => Promise<AutocompleteOption[]>;

/** Convert a Materialize `data` map into options. */
export function autocompleteDataToOptions(data: AutocompleteData): AutocompleteOption[] {
  return Object.entries(data).map(([value, image]) => (image ? { value, image } : { value }));
}

/**
 * Only allow image URLs with a safe scheme (http(s), blob, `data:image/*` or relative paths), so
 * `javascript:` and other schemes are dropped. The URL is set as a React prop, never concatenated into HTML.
 */
export function isSafeImageSrc(src: string | undefined): src is string {
  if (!src) return false;
  const trimmed = src.trim();
  if (/^data:image\//i.test(trimmed)) return true;
  if (/^(https?:|blob:)/i.test(trimmed)) return true;
  return !/^[a-z][a-z0-9+.-]*:/i.test(trimmed);
}

function optionLabel(option: AutocompleteOption): string {
  return option.label ?? option.value;
}

/** Default matcher: case-insensitive substring. */
export function defaultAutocompleteFilter(option: AutocompleteOption, query: string): boolean {
  return optionLabel(option).toLowerCase().includes(query.toLowerCase());
}

/**
 * Wrap the first case-insensitive match of `query` in `text` with a highlight span. Returns React
 * nodes, never HTML strings (Materialize's innerHTML highlighting was CVE-2019-11003).
 */
export function highlightMatch(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <span data-slot="autocomplete-highlight" className="font-medium text-foreground">
        {text.slice(index, index + q.length)}
      </span>
      {text.slice(index + q.length)}
    </>
  );
}

/* -------------------------------------------------------------------------------------------------
 * useAutocomplete: WAI-ARIA combobox state shared by Autocomplete and ChipsInput
 * -----------------------------------------------------------------------------------------------*/

export interface UseAutocompleteOptions {
  /** Current text in the input. */
  query: string;
  /** Static suggestions. */
  options?: AutocompleteOption[] | undefined;
  /** Materialize-style data map (alternative to `options`). */
  data?: AutocompleteData | undefined;
  /** Async loader; called after `debounceMs` with an AbortSignal that fires when superseded. */
  loadOptions?: AutocompleteLoader | undefined;
  /** Debounce for `loadOptions` in ms. */
  debounceMs?: number | undefined;
  /** Maximum number of suggestions shown. */
  limit?: number | undefined;
  /** Characters required before suggestions open. */
  minLength?: number | undefined;
  /** Custom matcher for static options. */
  filter?: ((option: AutocompleteOption, query: string) => boolean) | undefined;
  /** Hide options (e.g. chips that were already added). */
  exclude?: ((option: AutocompleteOption) => boolean) | undefined;
  /** Called when the user chooses an option. */
  onSelect: (option: AutocompleteOption) => void;
  /** Disable the popup. */
  disabled?: boolean | undefined;
  /** Whether a "no results" message is shown (keeps the popup open when empty). */
  showEmpty?: boolean | undefined;
  /** Extra gap (px) kept above the reference when the popup flips upward, e.g. to clear a floated label. */
  labelClearance?: number | undefined;
}

export interface AutocompleteState {
  /** The popup is visible. */
  open: boolean;
  /** Open or close the popup. */
  setOpen: (open: boolean) => void;
  /** Visible suggestions. */
  results: AutocompleteOption[];
  /** Index of the highlighted option (`-1` for none). */
  activeIndex: number;
  /** Highlight an option. */
  setActiveIndex: (index: number) => void;
  /** An async load is in flight. */
  loading: boolean;
  /** The query being matched. */
  query: string;
  /** Choose an option. */
  select: (option: AutocompleteOption) => void;
  /** DOM id of the listbox. */
  listboxId: string;
  /** DOM id of option `index`. */
  getOptionId: (index: number) => string;
  /** Callback ref for the element the popup is anchored to. */
  setReference: (node: HTMLElement | null) => void;
  /** Callback ref for the popup. */
  setFloating: (node: HTMLElement | null) => void;
  /** Position styles for the popup. */
  floatingStyles: React.CSSProperties;
  /** Combobox ARIA props and handlers to spread on the `<input>`. */
  inputProps: {
    role: "combobox";
    "aria-autocomplete": "list";
    "aria-expanded": boolean;
    "aria-controls": string | undefined;
    "aria-activedescendant": string | undefined;
    autoComplete: "off";
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    onFocus: () => void;
    onInput: () => void;
  };
}

/** Combobox state, filtering, async loading and anchored positioning. */
export function useAutocomplete({
  query,
  options,
  data,
  loadOptions,
  debounceMs = 250,
  limit = Number.POSITIVE_INFINITY,
  minLength = 1,
  filter = defaultAutocompleteFilter,
  exclude,
  onSelect,
  disabled = false,
  showEmpty = true,
  labelClearance = 0,
}: UseAutocompleteOptions): AutocompleteState {
  const baseId = React.useId();
  const listboxId = `${baseId}-listbox`;
  const [wantOpen, setWantOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [asyncResults, setAsyncResults] = React.useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = React.useState(false);

  const loadRef = React.useRef(loadOptions);
  React.useEffect(() => {
    loadRef.current = loadOptions;
  });
  const isAsync = loadOptions !== undefined;
  const enoughChars = query.trim().length >= minLength;
  const active = wantOpen && enoughChars && !disabled;

  React.useEffect(() => {
    if (!isAsync) return undefined;
    if (!active) {
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(() => {
      const load = loadRef.current;
      if (!load) return;
      load(query, controller.signal).then(
        (result) => {
          if (controller.signal.aborted) return;
          setAsyncResults(result);
          setLoading(false);
        },
        () => {
          if (controller.signal.aborted) return;
          setAsyncResults([]);
          setLoading(false);
        },
      );
    }, debounceMs);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isAsync, active, query, debounceMs]);

  const results = React.useMemo((): AutocompleteOption[] => {
    if (!active) return [];
    let list: AutocompleteOption[];
    if (isAsync) {
      list = asyncResults;
    } else {
      const source = options ?? (data ? autocompleteDataToOptions(data) : []);
      const q = query.trim().toLowerCase();
      list = source
        .filter((option) => filter(option, query.trim()))
        .map((option, index) => ({ option, index, at: optionLabel(option).toLowerCase().indexOf(q) }))
        // Materialize sorts by the position of the match; earlier matches first.
        .sort((a, b) => (a.at === -1 ? 1e9 : a.at) - (b.at === -1 ? 1e9 : b.at) || a.index - b.index)
        .map((entry) => entry.option);
    }
    if (exclude) list = list.filter((option) => !exclude(option));
    return list.slice(0, limit);
  }, [active, isAsync, asyncResults, options, data, query, filter, exclude, limit]);

  const open = active && (results.length > 0 || loading || showEmpty);

  // Reset the highlight whenever the result set changes.
  const resultsKey = results.map((option) => option.value).join("\u0000");
  React.useEffect(() => {
    setActiveIndex(-1);
  }, [resultsKey]);

  const { refs, floatingStyles } = useFloating<HTMLElement>({
    open,
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(({ placement }) => (placement.startsWith("top") ? labelClearance : 0)),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.max(120, Math.min(availableHeight, 320))}px`,
          });
        },
      }),
    ],
  });

  const getOptionId = React.useCallback((index: number) => `${baseId}-option-${index}`, [baseId]);

  // Keep the highlighted option visible.
  React.useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(getOptionId(activeIndex))?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, getOptionId]);

  const select = React.useCallback(
    (option: AutocompleteOption) => {
      if (option.disabled) return;
      onSelect(option);
      setWantOpen(false);
      setActiveIndex(-1);
    },
    [onSelect],
  );

  const move = (from: number, step: number): number => {
    if (results.length === 0) return -1;
    let index = from;
    for (let i = 0; i < results.length; i++) {
      index = (index + step + results.length) % results.length;
      if (!results[index]?.disabled) return index;
    }
    return -1;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (disabled || event.nativeEvent.isComposing) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) {
          setWantOpen(true);
          return;
        }
        setActiveIndex(move(activeIndex, 1));
        return;
      case "ArrowUp":
        event.preventDefault();
        if (!open) {
          setWantOpen(true);
          return;
        }
        setActiveIndex(move(activeIndex === -1 ? 0 : activeIndex, -1));
        return;
      case "Home":
      case "End":
        if (!open || results.length === 0) return;
        event.preventDefault();
        setActiveIndex(event.key === "Home" ? move(-1, 1) : move(results.length, -1));
        return;
      case "Enter": {
        const option = open && activeIndex >= 0 ? results[activeIndex] : undefined;
        if (option) {
          event.preventDefault();
          select(option);
        }
        return;
      }
      case "Escape":
        if (open) {
          event.preventDefault();
          setWantOpen(false);
          setActiveIndex(-1);
        }
        return;
      case "Tab":
        setWantOpen(false);
        return;
      default:
        return;
    }
  };

  return {
    open,
    setOpen: setWantOpen,
    results,
    activeIndex,
    setActiveIndex,
    loading,
    query,
    select,
    listboxId,
    getOptionId,
    setReference: refs.setReference,
    setFloating: refs.setFloating,
    floatingStyles,
    inputProps: {
      role: "combobox",
      "aria-autocomplete": "list",
      "aria-expanded": open,
      "aria-controls": open && results.length > 0 ? listboxId : undefined,
      "aria-activedescendant": open && activeIndex >= 0 ? getOptionId(activeIndex) : undefined,
      autoComplete: "off",
      onKeyDown,
      onBlur: () => {
        setWantOpen(false);
        setActiveIndex(-1);
      },
      onFocus: () => {
        if (minLength === 0) setWantOpen(true);
      },
      onInput: () => setWantOpen(true),
    },
  };
}

/* -------------------------------------------------------------------------------------------------
 * AutocompleteListbox
 * -----------------------------------------------------------------------------------------------*/

export interface AutocompleteListboxProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** State from `useAutocomplete`. */
  state: AutocompleteState;
  /** Accessible name of the listbox. */
  label?: string;
  /** Id of the element that names the listbox (wins over `label`), e.g. the field's label. */
  labelledBy?: string;
  /** Shown when nothing matches. `null` hides the popup instead. */
  emptyMessage?: React.ReactNode;
  /** Shown while `loadOptions` is pending. */
  loadingMessage?: React.ReactNode;
  /** Custom option content. Receives the option and the current query. */
  renderOption?: (option: AutocompleteOption, query: string) => React.ReactNode;
}

/** The suggestion popup: a portalled, collision-aware listbox (never clipped by overflow containers). */
export function AutocompleteListbox({
  state,
  label,
  labelledBy,
  emptyMessage = "No results",
  loadingMessage = "Loading…",
  renderOption,
  className,
  style,
  ...props
}: AutocompleteListboxProps): React.JSX.Element {
  const { open, results, activeIndex, loading, query } = state;
  const status = loading
    ? ""
    : open
      ? results.length === 0
        ? typeof emptyMessage === "string"
          ? emptyMessage
          : "No results"
        : `${results.length} ${results.length === 1 ? "suggestion" : "suggestions"} available`
      : "";

  return (
    <>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {status}
      </span>
      {open ? (
        <FloatingPortal>
          <div
            ref={state.setFloating}
            data-slot="autocomplete-content"
            style={{ ...state.floatingStyles, ...style }}
            className={cn(
              "pointer-events-auto z-[1000] overflow-y-auto bg-surface text-base shadow-z1 dark:bg-surface-2",
              "animate-md-fade-in motion-reduce:animate-none",
              className,
            )}
            // Keep focus in the input while clicking or scrolling the list.
            onMouseDown={(event) => event.preventDefault()}
            // Stop modal dialogs (Radix DismissableLayer) from treating a tap on the list as "outside".
            onPointerDown={(event) => event.stopPropagation()}
            {...props}
          >
            {results.length > 0 ? (
              <div
                id={state.listboxId}
                role="listbox"
                aria-labelledby={labelledBy}
                aria-label={labelledBy ? undefined : label}
                className="py-0"
              >
                {results.map((option, index) => {
                  const text = optionLabel(option);
                  return (
                    <div
                      key={`${option.value}-${index}`}
                      id={state.getOptionId(index)}
                      role="option"
                      aria-selected={index === activeIndex}
                      aria-disabled={option.disabled || undefined}
                      data-active={index === activeIndex ? "true" : undefined}
                      data-slot="autocomplete-option"
                      className={cn(
                        "flex min-h-[50px] cursor-pointer select-none items-center gap-4 px-4 py-2 text-base leading-[22px] text-secondary-focus",
                        "data-[active=true]:bg-surface-active hover:bg-surface-hover",
                        "aria-disabled:cursor-default aria-disabled:text-disabled-foreground aria-disabled:hover:bg-transparent",
                      )}
                      onPointerMove={() => {
                        if (!option.disabled && index !== activeIndex) state.setActiveIndex(index);
                      }}
                      onClick={() => state.select(option)}
                    >
                      {renderOption ? (
                        renderOption(option, query)
                      ) : (
                        <>
                          <span className="min-w-0 flex-1 truncate">{highlightMatch(text, query)}</span>
                          {isSafeImageSrc(option.image) ? (
                            <img
                              src={option.image}
                              alt={option.imageAlt ?? ""}
                              className="size-10 shrink-0 rounded-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : null}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                data-slot="autocomplete-status"
                className="flex min-h-[50px] items-center gap-3 px-4 text-sm text-muted-foreground"
              >
                {loading ? (
                  <>
                    <AutocompleteSpinner />
                    {loadingMessage}
                  </>
                ) : (
                  emptyMessage
                )}
              </div>
            )}
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}

function AutocompleteSpinner(): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-secondary border-t-transparent motion-reduce:animate-none"
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Autocomplete
 * -----------------------------------------------------------------------------------------------*/

export interface AutocompleteProps
  extends Omit<TextFieldProps, "value" | "defaultValue" | "type" | "role" | "showCount" | "enforceMaxLength"> {
  /** Input text (controlled). */
  value?: string;
  /** Initial input text (uncontrolled). */
  defaultValue?: string;
  /** Called with the new input text, on typing and when an option is chosen. */
  onValueChange?: (value: string) => void;
  /** Static suggestions. */
  options?: AutocompleteOption[];
  /** Materialize-style data map: label → image URL or `null`. */
  data?: AutocompleteData;
  /** Async suggestions. Receives an AbortSignal that fires when a newer query starts. */
  loadOptions?: AutocompleteLoader;
  /** Debounce for `loadOptions` (ms). */
  debounceMs?: number;
  /** Maximum number of suggestions (Materialize `limit`). */
  limit?: number;
  /** Characters required before suggestions show (Materialize `minLength`). */
  minLength?: number;
  /** Custom matcher for static options. */
  filter?: (option: AutocompleteOption, query: string) => boolean;
  /** Called when the user picks a suggestion (Materialize `onAutocomplete`). */
  onAutocomplete?: (option: AutocompleteOption) => void;
  /** Shown when nothing matches; `null` hides the popup instead. */
  emptyMessage?: React.ReactNode;
  /** Shown while `loadOptions` is pending. */
  loadingMessage?: React.ReactNode;
  /** Custom option content. */
  renderOption?: (option: AutocompleteOption, query: string) => React.ReactNode;
  /** Class for the popup. */
  listboxClassName?: string;
}

/**
 * Materialize autocomplete rebuilt as an accessible WAI-ARIA combobox with async loading,
 * keyboard support and a collision-aware popup.
 */
export function Autocomplete({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  options,
  data,
  loadOptions,
  debounceMs,
  limit,
  minLength = 1,
  filter,
  onAutocomplete,
  emptyMessage = "No results",
  loadingMessage,
  renderOption,
  listboxClassName,
  disabled,
  onChange,
  onKeyDown,
  onBlur,
  onFocus,
  onInput,
  ref,
  label,
  variant = "standard",
  id: idProp,
  ...props
}: AutocompleteProps): React.JSX.Element {
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const hasLabel = label !== undefined && label !== null && label !== false;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolled;
  const setValue = (next: string): void => {
    if (valueProp === undefined) setUncontrolled(next);
    onValueChange?.(next);
  };

  const state = useAutocomplete({
    query: value,
    options,
    data,
    loadOptions,
    debounceMs,
    limit,
    minLength,
    filter,
    disabled,
    showEmpty: emptyMessage !== null,
    labelClearance: hasLabel ? floatedLabelClearance[variant] : 0,
    onSelect: (option) => {
      setValue(option.value);
      onAutocomplete?.(option);
    },
  });

  const inputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      state.setReference(node);
    },
    [state.setReference],
  );

  return (
    <>
      <TextField
        {...props}
        {...state.inputProps}
        ref={(node) => {
          inputRef(node);
          if (typeof ref === "function") return ref(node);
          if (ref) ref.current = node;
          return undefined;
        }}
        id={id}
        label={label}
        variant={variant}
        type="text"
        disabled={disabled}
        value={value}
        onChange={composeEventHandlers(onChange, (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value))}
        onKeyDown={composeEventHandlers(onKeyDown, state.inputProps.onKeyDown)}
        onBlur={composeEventHandlers(onBlur, state.inputProps.onBlur)}
        onFocus={composeEventHandlers(onFocus, state.inputProps.onFocus)}
        onInput={composeEventHandlers(onInput, state.inputProps.onInput)}
      />
      <AutocompleteListbox
        state={state}
        labelledBy={hasLabel ? `${id}-label` : undefined}
        emptyMessage={emptyMessage}
        loadingMessage={loadingMessage}
        renderOption={renderOption}
        className={listboxClassName}
      />
    </>
  );
}
