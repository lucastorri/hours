import { FormatArgs } from "..";
import { ParserResult } from "../parser";

export default function (result: ParserResult, args: FormatArgs) {
  console.log(args);
  result.parsedLines.forEach((parsed) => console.log(parsed.line.content));
}
