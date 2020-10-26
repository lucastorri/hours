import { FormatArgs } from "..";
import { Entries } from "../parser";

export default function (entries: Entries, args: FormatArgs) {
  console.log(args);
  entries.all.forEach((entry) => console.log(entry.line.content));
}
