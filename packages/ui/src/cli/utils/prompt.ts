import prompts from "prompts";

import { CliError } from "./logger.ts";

export interface Choice {
  title: string;
  value: string;
  description?: string;
}

/** Interactive questions. Commands receive one so tests can answer without a TTY. */
export interface Prompter {
  confirm(message: string, initial?: boolean): Promise<boolean>;
  text(message: string, initial: string): Promise<string>;
  multiselect(message: string, choices: readonly Choice[]): Promise<string[]>;
}

function onCancel(): never {
  throw new CliError("Cancelled.", { exitCode: 130 });
}

/** Prompter backed by the `prompts` package. */
export function createPrompter(): Prompter {
  return {
    async confirm(message, initial = true) {
      const answer = (await prompts({ type: "confirm", name: "value", message, initial }, { onCancel })) as { value?: boolean };
      return answer.value ?? initial;
    },
    async text(message, initial) {
      const answer = (await prompts({ type: "text", name: "value", message, initial }, { onCancel })) as { value?: string };
      const value = (answer.value ?? initial).trim();
      return value === "" ? initial : value;
    },
    async multiselect(message, choices) {
      const answer = (await prompts(
        {
          type: "autocompleteMultiselect",
          name: "value",
          message,
          choices: choices.map((choice) => ({ ...choice })),
          hint: "Space to select, Enter to confirm. Type to filter.",
          instructions: false,
        },
        { onCancel },
      )) as { value?: string[] };
      return answer.value ?? [];
    },
  };
}

/** A prompter that fails loudly; used when input is not interactive. */
export function createNonInteractivePrompter(): Prompter {
  const fail = (message: string): never => {
    throw new CliError(`Cannot ask "${message}" because the terminal is not interactive.`, {
      hint: "Pass the answer as arguments or use --yes.",
    });
  };
  return {
    confirm: async (message) => fail(message),
    text: async (message) => fail(message),
    multiselect: async (message) => fail(message),
  };
}

/** Interactive prompter when stdin is a TTY, otherwise one that errors with a hint. */
export function defaultPrompter(): Prompter {
  return process.stdin.isTTY ? createPrompter() : createNonInteractivePrompter();
}
