#!/usr/bin/env node

import createParser, { Entry } from "./parser";
import yargs from "yargs";

const parse = (file: string, f: (entries: Entry[]) => any): Promise<void> =>
  createParser()
    .then((parser) => parser.parseFile(file))
    .then((entries) => f(entries))
    .catch((error) => console.error(error));

yargs(process.argv.slice(2))
  .option("input", {
    requiresArg: true,
    demandOption: true,
    alias: "i",
    type: "string",
    description: "Input file",
  })
  .command(
    "lint",
    "Lint a file",
    (_yargs) => {},
    (argv) => {
      parse(argv.input, (_entries) => {
        //TODO: implement
      });
    }
  )
  .command(
    "print",
    "Print all entries",
    (_yargs) => {},
    (argv) => {
      parse(argv.input, (entries) =>
        entries.forEach((entry) => console.log(entry))
      );
    }
  ).argv;
