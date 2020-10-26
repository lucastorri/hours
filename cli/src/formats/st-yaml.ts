import { ParserResult } from "../parser";

type DateEntries = { date: string; hours: number[]; comments: string[] };
export default function (result: ParserResult) {
  const groupedByDate: { [key: string]: DateEntries } = {};
  result.timeReports().map(({ date, duration, description }) => {
    const dateKey = `${date.year}-${date.month}-${date.day}`;
    const dateEntry = (groupedByDate[dateKey] = groupedByDate[dateKey] || {
      date: dateKey,
      hours: [],
      comments: [],
    });

    dateEntry.hours.push(duration);
    dateEntry.comments.push(description);
  });

  Object.keys(groupedByDate)
    .sort()
    .forEach((date) => {
      const entry = groupedByDate[date];
      const totalHours = entry.hours.reduce((a, b) => a + b, 0);
      const comment = entry.comments.join("; ");
      if (totalHours > 0) {
        console.log(
          tab`-
          |  date: ${entry.date}
          |  timeInHrs: ${totalHours}
          |  client: ${result.config.client}
          |  project: ${result.config.project}
          |  billable: true
          |  comment: ${comment}
          |`
        );
      }
    });
}

function tab(strings: TemplateStringsArray, ...args: any[]): string {
  return args
    .reduce<string>((s, arg, i) => s + String(arg) + strings[i + 1], strings[0])
    .split("\n")
    .map((line) => line.substring(line.indexOf("|") + 1))
    .join("\n")
    .trim();
}
