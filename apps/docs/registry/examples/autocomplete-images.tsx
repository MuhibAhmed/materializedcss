import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";

function avatar(color: string, letter: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="${color}"/><text x="20" y="26" font-family="sans-serif" font-size="18" fill="white" text-anchor="middle">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const people: AutocompleteOption[] = [
  { value: "Ada Lovelace", image: avatar("#00897b", "A") },
  { value: "Alan Turing", image: avatar("#3949ab", "A") },
  { value: "Grace Hopper", image: avatar("#d81b60", "G") },
  { value: "Katherine Johnson", image: avatar("#f4511e", "K") },
  { value: "Margaret Hamilton", image: avatar("#6d4c41", "M") },
];

export function AutocompleteImages() {
  return (
    <div className="w-full max-w-md">
      <Autocomplete label="Assign to" options={people} />
    </div>
  );
}
