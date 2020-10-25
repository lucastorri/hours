"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = __importDefault(require("./parser"));
var _a = process.argv, inputFile = _a[2];
parser_1.default()
    .then(function (parser) { return parser.parseFile(inputFile); })
    .then(function (entries) { return entries.forEach(function (entry) { return console.log(entry); }); })
    .catch(function (error) { return console.error(error); });
