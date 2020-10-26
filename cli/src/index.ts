#!/usr/bin/env node

import createParser, { Entries } from "./parser";
import yargs from "yargs";

const parse = (file: string, f: (entries: Entries) => any): Promise<void> =>
  createParser()
    .then((parser) => parser.parseFile(file))
    .then((entries) => f(entries))
    .catch((error) => console.error(error));

const run = <A>(f: (entries: Entries, args: A) => any) => (
  args: A & { input: string }
) => parse(args.input, (entries) => f(entries, args));

type Formatter = (entries: Entries, args: FormatArgs) => any;
export type FormatArgs = {
  format: string;
};

yargs(process.argv.slice(2))
  .option("input", {
    requiresArg: true,
    alias: "i",
    type: "string",
    description: "Input file",
    default: "project.hours",
  })
  .command(
    "lint",
    "Lint a file",
    (_yargs) => {},
    run((entries) => {})
  )
  .command(
    "export [format]",
    "Export the input file in a given format",
    (yargs) => {
      yargs.positional("format", {
        describe: "Format to output",
        demandOption: true,
        type: "string",
      });
    },
    run<FormatArgs>((entries, args) => {
      const formatter: Formatter = require(`./formats/${args.format}`).default;

      return formatter(entries, args);
    })
  )
  .command(
    "print",
    "Print all entries",
    (_yargs) => {},
    run((entries) => entries.all.forEach((entry) => console.log(entry)))
  ).argv;
