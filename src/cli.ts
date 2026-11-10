#!/usr/bin/env node
import { parseArgs } from "node:util";
import { report } from "./formats/report.ts";
import { simple } from "./formats/simple.ts";
import { softwaretechnik } from "./formats/softwaretechnik.ts";
import { loadFileHours, loadVaultHours } from "./todo.ts";
import type { FormatOptions, HoursDocument } from "./types.ts";

const usage = `Usage: hours export <format> [options]

Formats:
  report, stats                 grouped month/week/day report
  softwaretechnik, st-yaml      Softwaretechnik YAML records
  simple                        canonical entry lines

Input:
  -i, --input <path>            external file to parse (default: project.hours)
      --vault <reference>       hours file in the configured Todo vault

Options:
  -t, --interval <YYYY-MM>      include one month only
  -h, --help                    show this help`;

type Formatter = (document: HoursDocument, options: FormatOptions) => string;
const formats: Readonly<Record<string, Formatter>> = {
  report,
  stats: report,
  softwaretechnik,
  "st-yaml": softwaretechnik,
  simple,
};

const main = async (): Promise<void> => {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    strict: true,
    options: {
      input: { type: "string", short: "i" },
      vault: { type: "string" },
      interval: { type: "string", short: "t" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help === true) {
    console.log(usage);
    return;
  }
  if (positionals[0] !== "export" || positionals.length !== 2) throw new Error(usage);
  const formatName = positionals[1] ?? "";
  const formatter = formats[formatName];
  if (formatter === undefined)
    throw new Error(`unknown format "${formatName}"; choose ${Object.keys(formats).join(", ")}`);
  if (values.input !== undefined && values.vault !== undefined)
    throw new Error("choose either --input or --vault, not both");
  if (values.interval !== undefined && !/^\d{4}-(?:0[1-9]|1[0-2])$/.test(values.interval))
    throw new Error(`interval must use YYYY-MM, not "${values.interval}"`);

  const document =
    values.vault === undefined
      ? await loadFileHours(values.input ?? "project.hours")
      : loadVaultHours(values.vault);
  const output = formatter(document, {
    ...(values.interval === undefined ? {} : { interval: values.interval }),
    color: process.stdout.isTTY === true,
  });
  if (output !== "") process.stdout.write(`${output}\n`);
};

try {
  await main();
} catch (error) {
  console.error(`hours: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
