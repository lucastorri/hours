import type { FormatOptions, HoursDocument, HoursEntry } from "../types.ts";
import { entriesInInterval } from "../types.ts";

type Row = {
  readonly key: string;
  readonly prefix: string;
  readonly label: string;
  readonly hours: number;
  readonly comments: readonly string[];
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const isoWeek = (day: string): string => {
  const date = new Date(`${day}T00:00:00Z`);
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - weekday);
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const week = Math.ceil((date.getTime() - yearStart + 86_400_000) / 604_800_000);
  return String(week).padStart(2, "0");
};

const add = (
  rows: Map<string, Row>,
  key: string,
  prefix: string,
  label: string,
  entry: HoursEntry,
  comments: boolean,
): void => {
  const current = rows.get(key);
  rows.set(key, {
    key,
    prefix,
    label,
    hours: (current?.hours ?? 0) + entry.hours,
    comments: comments ? [...(current?.comments ?? []), entry.description] : [],
  });
};

const style = (enabled: boolean, code: number, value: string | number): string =>
  enabled ? `\u001b[${code}m${value}\u001b[39m` : String(value);

export const report = (document: HoursDocument, options: FormatOptions = {}): string => {
  const rows = new Map<string, Row>();
  for (const entry of entriesInInterval(document, options.interval)) {
    const month = entry.date.slice(0, 7);
    const week = isoWeek(entry.date);
    const date = new Date(`${entry.date}T00:00:00Z`);
    add(rows, month, "", `${monthNames[date.getUTCMonth()] ?? ""} ${month}`, entry, false);
    add(rows, `${month}-${week}`, "  ", `Week #${week}`, entry, false);
    add(
      rows,
      `${month}-${week}-${entry.date.slice(8, 10)}`,
      "    ",
      `${weekdays[date.getUTCDay()] ?? ""} ${entry.date}`,
      entry,
      true,
    );
  }

  const color = options.color === true;
  return [...rows.values()]
    .toSorted((left, right) => left.key.localeCompare(right.key))
    .map((row) => {
      const comments = row.comments.length === 0 ? "" : row.comments.join("; ");
      const underlined = color && comments !== "" ? `\u001b[4m${comments}\u001b[24m` : comments;
      return `${row.prefix}${style(color, 32, row.label)}: [${style(color, 35, row.hours)}] ${underlined}`;
    })
    .join("\n");
};
