import { DateTime } from "luxon";
import { FormatArgs } from "..";
import { ParserResult, TimeReport } from "../parser";

type TimeFrameOptions = {
  prefix: string;
  includeComments: boolean;
};

const defaultTimeFrameOptions: TimeFrameOptions = {
  prefix: "",
  includeComments: false,
};

class TimeFrame {
  entries: { [key: string]: DateEntry } = {};
  extractKeyAndLabel: (date: DateTime) => [string, string?];
  options: TimeFrameOptions;

  constructor(
    extractKeyAndLabel: (date: DateTime) => [string, string?],
    options?: Partial<TimeFrameOptions>
  ) {
    this.extractKeyAndLabel = extractKeyAndLabel;
    this.options = Object.assign({}, defaultTimeFrameOptions, options);
  }

  add(report: TimeReport) {
    const [key, possibleLabel] = this.extractKeyAndLabel(report.date);
    const label = possibleLabel || key;
    const entry =
      this.entries[key] ||
      (this.entries[key] = new DateEntry(this, key, label));
    entry.add(report);
  }

  all(): DateEntry[] {
    return Object.values(this.entries);
  }
}

class DateEntry {
  parent: TimeFrame;
  key: string;
  label: string;
  hours: number = 0;
  comments: string[] = [];

  constructor(parent: TimeFrame, key: string, label: string) {
    this.parent = parent;
    this.key = key;
    this.label = label;
  }

  add(report: TimeReport) {
    this.hours += report.duration;
    this.comments.push(report.description);
  }

  toString(): string {
    return `${this.parent.options.prefix}${this.label}: [${this.hours}] ${
      this.parent.options.includeComments ? this.comments.join("; ") : ""
    }`;
  }
}

export default function (result: ParserResult) {
  const byMonth = new TimeFrame((date) => [date.toFormat("yyyy-MM")]);
  const byWeek = new TimeFrame(
    (date) => [date.toFormat("yyyy-MM-WW"), date.toFormat("'Week #'WW")],
    { prefix: "  " }
  );
  const byDay = new TimeFrame(
    (date) => [date.toFormat("yyyy-MM-WW-dd"), date.toFormat("yyyy-MM-dd")],
    { prefix: "    ", includeComments: true }
  );

  result.timeReports().forEach((report) => {
    byMonth.add(report);
    byWeek.add(report);
    byDay.add(report);
  });

  byMonth
    .all()
    .concat(byWeek.all())
    .concat(byDay.all())
    .sort((a, b) => a.key.localeCompare(b.key))
    .forEach((entry) => console.log(entry.toString()));
}
