export type HoursDirective = {
  readonly line: number;
  readonly name: string;
  readonly value: string;
};

export type HoursEntry = {
  readonly line: number;
  readonly date: string;
  readonly hours: number;
  readonly description: string;
};

export type HoursDocument = {
  readonly version: 1;
  readonly source: { readonly kind: "stdin" } | { readonly kind: "vault"; readonly path: string };
  readonly directives: readonly HoursDirective[];
  readonly entries: readonly HoursEntry[];
};

export type FormatOptions = {
  readonly interval?: string;
  readonly color?: boolean;
};

export const directiveValue = (document: HoursDocument, name: string): string | undefined =>
  document.directives.findLast((directive) => directive.name === name)?.value;

export const entriesInInterval = (
  document: HoursDocument,
  interval: string | undefined,
): readonly HoursEntry[] =>
  interval === undefined
    ? document.entries
    : document.entries.filter((entry) => entry.date.startsWith(`${interval}-`));
