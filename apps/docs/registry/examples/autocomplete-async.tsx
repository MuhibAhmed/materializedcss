"use client";

import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";

const COUNTRIES = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile", "China", "Denmark", "Egypt",
  "Finland", "France", "Germany", "Greece", "India", "Indonesia", "Ireland", "Italy", "Japan", "Kenya",
  "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Poland",
  "Portugal", "Spain", "Sweden", "Switzerland", "Turkey", "United Kingdom", "United States", "Vietnam",
];

/** Pretend API: answers after 400ms and stops early when the request is aborted. */
function searchCountries(query: string, signal: AbortSignal): Promise<AutocompleteOption[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      resolve(COUNTRIES.filter((name) => name.toLowerCase().includes(q)).map((value) => ({ value })));
    }, 400);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

export function AutocompleteAsync() {
  return (
    <div className="w-full max-w-md">
      <Autocomplete label="Country" loadOptions={searchCountries} debounceMs={200} emptyMessage="No countries found" />
    </div>
  );
}
