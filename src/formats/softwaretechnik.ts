import type { FormatOptions, HoursDocument } from "../types.ts";
import { directiveValue, entriesInInterval } from "../types.ts";

type DateGroup = {
  readonly date: string;
  readonly hours: number;
  readonly comments: readonly string[];
};

export const softwaretechnik = (document: HoursDocument, options: FormatOptions = {}): string => {
  const grouped = new Map<string, DateGroup>();
  for (const entry of entriesInInterval(document, options.interval)) {
    const current = grouped.get(entry.date);
    grouped.set(entry.date, {
      date: entry.date,
      hours: (current?.hours ?? 0) + entry.hours,
      comments: [...(current?.comments ?? []), entry.description],
    });
  }

  const client = directiveValue(document, "client") ?? "";
  const project = directiveValue(document, "project") ?? "";
  return [...grouped.values()]
    .filter((entry) => entry.hours > 0)
    .toSorted((left, right) => left.date.localeCompare(right.date))
    .map((entry) =>
      [
        "-",
        `  date: ${entry.date}`,
        `  timeInHrs: ${entry.hours}`,
        `  client: ${client}`,
        `  project: ${project}`,
        "  billable: true",
        `  comment: ${entry.comments.join("; ")}`,
      ].join("\n"),
    )
    .join("\n");
};
