"use client";

import * as React from "react";

import {
  AutocompleteListbox,
  useAutocomplete,
  type AutocompleteLoader,
  type AutocompleteOption,
} from "@/components/ui/autocomplete";
import { Chip } from "@/components/ui/chip";
import {
  hasFieldError,
  joinIds,
  TextFieldFooter,
  TextFieldLabel,
  TextFieldPrefix,
  TextFieldRoot,
  textFieldControlVariants,
  textFieldDescribedBy,
  type TextFieldVariant,
} from "@/components/ui/text-field";
import { cn } from "@/lib/utils";

/** A chip: plain text, or an object with an avatar image (Materialize `{ tag, image }`). */
export type ChipsInputChip = string | { tag: string; image?: string; imageAlt?: string };

/** The text of a chip. */
export function chipTag(chip: ChipsInputChip): string {
  return typeof chip === "string" ? chip : chip.tag;
}

export interface ChipsInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "prefix" | "size" | "type"> {
  /** Chips (controlled). */
  value?: ChipsInputChip[];
  /** Initial chips (uncontrolled). */
  defaultValue?: ChipsInputChip[];
  /** Called with the new list whenever a chip is added or removed. */
  onValueChange?: (value: ChipsInputChip[]) => void;
  /** Called after a chip is added (Materialize `onChipAdd`). */
  onAdd?: (chip: ChipsInputChip) => void;
  /** Called after a chip is removed (Materialize `onChipDelete`). */
  onDelete?: (chip: ChipsInputChip, index: number) => void;
  /** Maximum number of chips. */
  limit?: number;
  /** Allow the same text twice. */
  allowDuplicates?: boolean;
  /** Placeholder while there are no chips. */
  placeholder?: string;
  /** Placeholder once at least one chip exists (Materialize `secondaryPlaceholder`). */
  secondaryPlaceholder?: string;
  /** Floating label. */
  label?: React.ReactNode;
  /** Helper text under the field. */
  helperText?: React.ReactNode;
  /** `true` or an error message. */
  error?: React.ReactNode;
  /** Leading icon. */
  prefix?: React.ReactNode;
  /** Visual style. */
  variant?: TextFieldVariant;
  /** Static suggestions shown while typing (Materialize `autocompleteOptions`). */
  suggestions?: Array<string | AutocompleteOption>;
  /** Async suggestions. */
  loadSuggestions?: AutocompleteLoader;
  /** Maximum suggestions shown. */
  suggestionLimit?: number;
  /** Characters typed before suggestions show. */
  suggestionMinLength?: number;
  /** Class for the text `<input>`. `className` goes on the wrapper. */
  inputClassName?: string;
  /** Stretch to the container width. */
  fullWidth?: boolean;
}

/**
 * Materialize `.chips` tag input: type and press Enter or comma to add a chip, Backspace to select
 * and remove chips, arrow keys to move between them, with optional suggestions.
 */
export function ChipsInput({
  id: idProp,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  onAdd,
  onDelete,
  limit = Number.POSITIVE_INFINITY,
  allowDuplicates = false,
  placeholder,
  secondaryPlaceholder,
  label,
  helperText,
  error,
  prefix,
  variant = "standard",
  suggestions,
  loadSuggestions,
  suggestionLimit,
  suggestionMinLength = 1,
  className,
  inputClassName,
  fullWidth = true,
  name,
  required,
  disabled = false,
  form,
  style,
  onKeyDown,
  onPaste,
  "aria-describedby": describedByProp,
  ...props
}: ChipsInputProps): React.JSX.Element {
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const hintId = `${id}-hint`;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const chipRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  const [uncontrolled, setUncontrolled] = React.useState<ChipsInputChip[]>(defaultValue);
  const chips = valueProp ?? uncontrolled;
  const [text, setText] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [announcement, setAnnouncement] = React.useState("");
  const [pendingFocus, setPendingFocus] = React.useState<number | "input" | null>(null);

  const tags = chips.map(chipTag);
  const full = chips.length >= limit;
  const invalid = hasFieldError(error);
  const hasPrefix = prefix !== undefined && prefix !== null;
  const hasSuggestions = suggestions !== undefined || loadSuggestions !== undefined;
  const labelText = typeof label === "string" ? label : "Chips";

  const commit = (next: ChipsInputChip[]): void => {
    if (valueProp === undefined) setUncontrolled(next);
    onValueChange?.(next);
  };

  const add = (raw: ChipsInputChip): boolean => {
    const tag = chipTag(raw).trim();
    if (!tag || full || disabled) return false;
    if (!allowDuplicates && tags.includes(tag)) return false;
    const chip: ChipsInputChip = typeof raw === "string" ? tag : { ...raw, tag };
    commit([...chips, chip]);
    onAdd?.(chip);
    setAnnouncement(`Added ${tag}`);
    return true;
  };

  const remove = (index: number, focusAfter: number | "input"): void => {
    const chip = chips[index];
    if (chip === undefined || disabled) return;
    commit(chips.filter((_, i) => i !== index));
    onDelete?.(chip, index);
    setAnnouncement(`Removed ${chipTag(chip)}`);
    setPendingFocus(focusAfter);
  };

  // Move focus after a removal once the DOM has updated.
  React.useEffect(() => {
    if (pendingFocus === null) return;
    if (pendingFocus === "input" || chips.length === 0) {
      inputRef.current?.focus();
    } else {
      const index = Math.max(0, Math.min(pendingFocus, chips.length - 1));
      setActiveIndex(index);
      chipRefs.current[index]?.focus();
    }
    setPendingFocus(null);
  }, [pendingFocus, chips.length]);

  const focusChip = (index: number): void => {
    if (chips.length === 0) return;
    const clamped = Math.max(0, Math.min(index, chips.length - 1));
    setActiveIndex(clamped);
    chipRefs.current[clamped]?.focus();
  };

  const suggestionOptions = React.useMemo(
    () => suggestions?.map((entry) => (typeof entry === "string" ? { value: entry } : entry)),
    [suggestions],
  );

  const autocomplete = useAutocomplete({
    query: text,
    options: suggestionOptions,
    loadOptions: loadSuggestions,
    limit: suggestionLimit,
    minLength: suggestionMinLength,
    disabled: !hasSuggestions || disabled || full,
    showEmpty: false,
    exclude: allowDuplicates ? undefined : (option) => tags.includes(option.value),
    onSelect: (option) => {
      if (add(option.image ? { tag: option.value, image: option.image } : option.value)) setText("");
    },
  });

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    onKeyDown?.(event);
    if (hasSuggestions) autocomplete.inputProps.onKeyDown(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    const input = event.currentTarget;
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
    switch (event.key) {
      case "Enter":
      case ",": {
        if (event.key === "Enter" && text.trim() === "") return; // Let Enter submit the form.
        event.preventDefault();
        if (add(text)) setText("");
        return;
      }
      case "Backspace":
        if (text === "" && chips.length > 0) {
          event.preventDefault();
          focusChip(chips.length - 1);
        }
        return;
      case "ArrowLeft":
        if (atStart && chips.length > 0) {
          event.preventDefault();
          focusChip(chips.length - 1);
        }
        return;
      default:
        return;
    }
  };

  const handleChipKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, index: number): void => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        focusChip(index - 1);
        return;
      case "ArrowRight":
        event.preventDefault();
        if (index >= chips.length - 1) inputRef.current?.focus();
        else focusChip(index + 1);
        return;
      case "Home":
        event.preventDefault();
        focusChip(0);
        return;
      case "End":
        event.preventDefault();
        focusChip(chips.length - 1);
        return;
      case "Backspace":
        event.preventDefault();
        remove(index, chips.length === 1 ? "input" : Math.max(0, index - 1));
        return;
      case "Delete":
        event.preventDefault();
        remove(index, index >= chips.length - 1 ? "input" : index);
        return;
      default:
        // Typing a character on a chip continues in the input.
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) inputRef.current?.focus();
        return;
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>): void => {
    onPaste?.(event);
    if (event.defaultPrevented) return;
    const pasted = event.clipboardData.getData("text");
    if (!pasted.includes(",") && !pasted.includes("\n")) return;
    event.preventDefault();
    const parts = pasted.split(/[,\n]/).map((part) => part.trim()).filter(Boolean);
    const next = [...chips];
    for (const part of parts) {
      if (next.length >= limit) break;
      if (!allowDuplicates && next.some((chip) => chipTag(chip) === part)) continue;
      next.push(part);
      onAdd?.(part);
    }
    if (next.length !== chips.length) {
      commit(next);
      setAnnouncement(`Added ${next.length - chips.length} chips`);
    }
  };

  const tabbableIndex = Math.min(activeIndex, chips.length - 1);
  const shownPlaceholder = chips.length > 0 ? (secondaryPlaceholder ?? "") : (placeholder ?? "");
  const hasLabel = label !== undefined && label !== null;

  return (
    <TextFieldRoot variant={variant} fullWidth={fullWidth} className={className} style={style}>
      {hasPrefix ? <TextFieldPrefix variant={variant}>{prefix}</TextFieldPrefix> : null}
      <div
        ref={autocomplete.setReference}
        data-slot="chips-input"
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "true" : undefined}
        className={cn(
          textFieldControlVariants({ variant, prefix: hasPrefix }),
          "flex h-auto cursor-text flex-wrap items-center gap-1.5",
          variant === "standard"
            ? "min-h-12 py-1.5 focus-within:border-secondary focus-within:shadow-[0_1px_0_0_var(--secondary)]"
            : "min-h-14 py-2.5 focus-within:border-secondary focus-within:shadow-[inset_0_0_0_1px_var(--secondary)]",
          "data-[disabled]:cursor-default data-[disabled]:border-dotted data-[disabled]:border-foreground/40",
          "data-[invalid=true]:border-error data-[invalid=true]:focus-within:border-error",
          invalid && variant === "standard" && "shadow-[0_1px_0_0_var(--error)] focus-within:shadow-[0_1px_0_0_var(--error)]",
          invalid && variant === "outlined" && "shadow-[inset_0_0_0_1px_var(--error)] focus-within:shadow-[inset_0_0_0_1px_var(--error)]",
        )}
        onMouseDown={(event) => {
          // Clicking the empty area focuses the input (but not when clicking a chip).
          if (event.target === event.currentTarget) {
            event.preventDefault();
            inputRef.current?.focus();
          }
        }}
      >
        {chips.length > 0 ? (
          <div role="list" aria-label={`Selected ${labelText.toLowerCase()}`} className="contents">
            {chips.map((chip, index) => {
              const tag = chipTag(chip);
              return (
                <Chip
                  key={`${tag}-${index}`}
                  ref={(node) => {
                    chipRefs.current[index] = node;
                  }}
                  role="listitem"
                  tabIndex={disabled ? undefined : index === tabbableIndex ? 0 : -1}
                  aria-label={`${tag}. Press Delete or Backspace to remove.`}
                  image={typeof chip === "string" ? undefined : chip.image}
                  imageAlt={typeof chip === "string" ? undefined : chip.imageAlt}
                  disabled={disabled}
                  className="focus:bg-secondary focus:text-secondary-foreground"
                  onFocus={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleChipKeyDown(event, index)}
                  onDelete={disabled ? undefined : () => remove(index, "input")}
                  deleteLabel={`Remove ${tag}`}
                  deleteButtonProps={{ tabIndex: -1 }}
                >
                  {tag}
                </Chip>
              );
            })}
          </div>
        ) : null}
        <input
          ref={inputRef}
          id={id}
          type="text"
          form={form}
          value={text}
          disabled={disabled}
          readOnly={full}
          required={required && chips.length === 0}
          placeholder={shownPlaceholder || " "}
          enterKeyHint="enter"
          aria-invalid={invalid || undefined}
          aria-describedby={joinIds(
            textFieldDescribedBy({ id, helperText, error, describedBy: describedByProp }),
            hintId,
          )}
          {...props}
          {...(hasSuggestions
            ? {
                role: autocomplete.inputProps.role,
                "aria-autocomplete": autocomplete.inputProps["aria-autocomplete"],
                "aria-expanded": autocomplete.inputProps["aria-expanded"],
                "aria-controls": autocomplete.inputProps["aria-controls"],
                "aria-activedescendant": autocomplete.inputProps["aria-activedescendant"],
                autoComplete: "off",
                onBlur: composeBlur(props.onBlur, autocomplete.inputProps.onBlur),
                onFocus: composeBlur(props.onFocus, autocomplete.inputProps.onFocus),
              }
            : {})}
          onChange={(event) => {
            setText(event.target.value);
            if (hasSuggestions) autocomplete.inputProps.onInput();
          }}
          onKeyDown={handleInputKeyDown}
          onPaste={handlePaste}
          className={cn(
            "h-8 min-w-[7.5rem] flex-1 border-0 bg-transparent p-0 text-base text-foreground outline-none placeholder:text-foreground/40 disabled:cursor-default",
            hasLabel && chips.length === 0 && "placeholder:text-transparent focus:placeholder:text-foreground/40",
            inputClassName,
          )}
        />
      </div>
      {hasLabel ? (
        <TextFieldLabel
          htmlFor={id}
          variant={variant}
          hasPrefix={hasPrefix}
          floating={chips.length > 0 || text.length > 0}
          className={cn(invalid && "text-error peer-focus-within:text-error")}
        >
          {label}
        </TextFieldLabel>
      ) : null}
      <span id={hintId} className="sr-only">
        Press Enter or comma to add. Press Backspace or Left Arrow to move to the chips.
      </span>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
      {name
        ? tags.map((tag, index) => <input key={`${tag}-${index}`} type="hidden" name={name} value={tag} form={form} />)
        : null}
      {hasSuggestions ? <AutocompleteListbox state={autocomplete} label={`${labelText} suggestions`} emptyMessage={null} /> : null}
      <TextFieldFooter fieldId={id} variant={variant} hasPrefix={hasPrefix} helperText={helperText} error={error} />
    </TextFieldRoot>
  );
}

function composeBlur<E>(user: ((event: E) => void) | undefined, own: () => void): (event: E) => void {
  return (event: E) => {
    user?.(event);
    own();
  };
}
