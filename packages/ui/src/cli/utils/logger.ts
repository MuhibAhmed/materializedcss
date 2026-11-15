import kleur from "kleur";

/** Output sink used by every command. Pass `createLogger({ silent: true })` in tests. */
export interface Logger {
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  /** Plain line, no prefix. */
  log(message?: string): void;
  /** Dimmed secondary information. */
  muted(message: string): void;
}

export interface LoggerOptions {
  silent?: boolean;
  /** Write to these functions instead of the console (useful for capturing output). */
  stdout?: (line: string) => void;
  stderr?: (line: string) => void;
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const out = options.silent ? (): void => undefined : (options.stdout ?? ((line: string): void => console.log(line)));
  const err = options.silent ? (): void => undefined : (options.stderr ?? ((line: string): void => console.error(line)));
  return {
    info: (message) => out(`${kleur.cyan("i")} ${message}`),
    success: (message) => out(`${kleur.green("✔")} ${message}`),
    warn: (message) => err(`${kleur.yellow("!")} ${kleur.yellow(message)}`),
    error: (message) => err(`${kleur.red("✖")} ${kleur.red(message)}`),
    log: (message = "") => out(message),
    muted: (message) => out(kleur.dim(message)),
  };
}

/** An expected failure with an actionable message; the CLI prints it without a stack trace. */
export class CliError extends Error {
  readonly exitCode: number;
  /** Extra lines (instructions) printed after the message. */
  readonly hint: string | undefined;

  constructor(message: string, options: { exitCode?: number; hint?: string } = {}) {
    super(message);
    this.name = "CliError";
    this.exitCode = options.exitCode ?? 1;
    this.hint = options.hint;
  }
}

/** Format a path for display: relative to `cwd` with forward slashes. */
export function highlightPath(path: string): string {
  return kleur.cyan(path);
}
