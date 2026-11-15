import { ChipsInput } from "@/components/ui/chips-input";

const languages = ["Go", "Haskell", "Java", "JavaScript", "Kotlin", "Python", "Ruby", "Rust", "Swift", "TypeScript"];

export function ChipsInputSuggestions() {
  return (
    <div className="w-full max-w-md">
      <ChipsInput label="Languages" suggestions={languages} suggestionLimit={5} limit={5} helperText="Up to 5" />
    </div>
  );
}
