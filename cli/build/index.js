"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = __importDefault(require("./parser"));
var yargs_1 = __importDefault(require("yargs"));
var parse = function (file, f) {
    return parser_1.default()
        .then(function (parser) { return parser.parseFile(file); })
        .then(function (entries) { return f(entries); })
        .catch(function (error) { return console.error(error); });
};
yargs_1.default(process.argv.slice(2))
    .option("input", {
    requiresArg: true,
    alias: "i",
    type: "string",
    description: "Input file",
})
    .demandOption(["i"])
    .command("print", "Print all entries", function (_yargs) { }, function (argv) {
    parse(argv.input, function (entries) {
        return entries.forEach(function (entry) { return console.log(entry); });
    });
}).argv;
