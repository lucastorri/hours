import { FormatArgs } from "..";
import { ParserResult } from "../parser";

export default function (result: ParserResult, args: FormatArgs) {
  const hoursPerMonth: { [key: string]: number } = {};

  result.timeReports().forEach((report) => {
    const month = report.date.toFormat("yyyy-MM");
    hoursPerMonth[month] = (hoursPerMonth[month] || 0) + report.duration;
  });

  console.log("Hours/Month:");
  Object.keys(hoursPerMonth)
    .sort()
    .forEach((month) => console.log(`  ${month}: ${hoursPerMonth[month]}`));
}
