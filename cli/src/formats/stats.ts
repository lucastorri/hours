import { FormatArgs } from "..";
import { ParserResult } from "../parser";

type DateEntries = {
  hours: number;
  comments: string[];
};

export default function (result: ParserResult, args: FormatArgs) {
  const byMonth: { [key: string]: number } = {};
  const byDay: { [key: string]: DateEntries } = {};

  result.timeReports().forEach(({ date, description, duration}) => {
    const month = date.toFormat("yyyy-MM");
    byMonth[month] = (byMonth[month] || 0) + duration;

    const day = date.toFormat("yyyy-MM-dd");
    const dayEntry = (byDay[day] = byDay[day] || {
      hours: 0,
      comments: [],
    });

    dayEntry.hours = dayEntry.hours + duration;
    dayEntry.comments.push(description);
  });

  const descriptionsByDate: { [key: string]: string } = {};
  Object.keys(byMonth).forEach(month => descriptionsByDate[month] = `  ${month}: [${byMonth[month]}]`);
  Object.keys(byDay).forEach(day => {
    const entry = byDay[day];
    descriptionsByDate[day] = `    ${day}: [${entry.hours}] ${entry.comments.join("; ")}`;
  });

  console.log("Hours");
  Object.keys(descriptionsByDate)
    .sort()
    .forEach(date => console.log(descriptionsByDate[date]));
}
