#!/usr/bin/env node

import createParser, { ParserResult } from "./parser";
import yargs from "yargs";

const parse = (file: string, f: (result: ParserResult) => any): Promise<void> =>
  createParser()
    .then((parser) => parser.parseFile(file))
    .then((entries) => f(entries))
    .catch((error) => console.error(error));

const run = <A>(f: (result: ParserResult, args: A) => any) => (
  args: A & { input: string }
) => parse(args.input, (entries) => f(entries, args));

type Formatter = (result: ParserResult, args: FormatArgs) => any;
export type FormatArgs = {
  format: string;
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
      yargs.positional("format", {
        describe: "Format to output",
        demandOption: true,
        type: "string",
      });
    },
    run<FormatArgs>((result, args) => {
      const formatter: Formatter = require(`./formats/${args.format}`).default;

      return formatter(result, args);
    })
  )
  .command(
    "debug",
    "Print all entries in a file",
    (_yargs) => {},
    run((result) => result.parsedLines.forEach((parsed) => console.log(parsed)))
  ).argv;
