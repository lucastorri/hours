#!/usr/bin/env node

import createParser, { ParserResult } from "./parser";
import yargs from "yargs";
import { DateTime, Interval } from "luxon";
import { openStdin } from "process";

const parse = (
  file: string,
  f: (result: ParserResult) => any
): Promise<void> =>
  createParser()
    .then((parser) => parser.parseFile(file))
    .then((entries) => f(entries))
    .catch((error) => console.error(error));

type Formatter = (result: ParserResult, args: FormatArgs) => any;
export type FormatArgs = {
  interval?: Interval;
};

yargs(process.argv.slice(2))
  .scriptName("hours")
  .option("input", {
    requiresArg: true,
    alias: "i",
    type: "string",
    description: "Input file",
    default: "project.hours",
  })
  .command(
    "export [format]",
    "Export the input file in a given format",
    (yargs) => {
      return yargs
        .positional("format", {
          describe: "Format to output",
          demandOption: true,
          type: "string",
        })
        .option("interval", {
          requiresArg: false,
          alias: "t",
          type: "string",
          description: "The month to export, like 2022-06",
          coerce: (month: string): Interval => {
            const start = DateTime.fromFormat(month, "yyyy-MM");
            const end = start.endOf("month");
            return Interval.fromDateTimes(start, end);
          },
        });
    },
    (args) => {
      const formatter: Formatter = require(`./formats/${args.format}`).default;
      parse(args.input, (entries) => formatter(entries, args as FormatArgs));
    }
  ).argv;
