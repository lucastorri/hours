import type { FormatOptions, HoursDocument } from "../types.ts";
import { entriesInInterval } from "../types.ts";

/** Canonical entry lines only, suitable for a plain-text export. */
export const simple = (document: HoursDocument, options: FormatOptions = {}): string =>
  entriesInInterval(document, options.interval)
    .map((entry) => `${entry.date} - ${entry.hours} - ${entry.description}`)
    .join("\n");
