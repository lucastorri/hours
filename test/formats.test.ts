import assert from "node:assert/strict";
import { test } from "node:test";
import { report } from "../src/formats/report.ts";
import { simple } from "../src/formats/simple.ts";
import { softwaretechnik } from "../src/formats/softwaretechnik.ts";
import type { HoursDocument } from "../src/types.ts";

const document: HoursDocument = {
  version: 1,
  source: { kind: "vault", path: "Work/Client.hours" },
  directives: [
    { line: 1, name: "client", value: "Acme" },
    { line: 2, name: "project", value: "Planning" },
  ],
  entries: [
    { line: 4, date: "2026-11-10", hours: 1.5, description: "Architecture" },
    { line: 5, date: "2026-11-10", hours: 0.5, description: "Review" },
    { line: 6, date: "2026-11-11", hours: 2, description: "Implementation" },
    { line: 8, date: "2026-12-01", hours: 3, description: "December" },
  ],
};

test("report preserves month, week, day, totals, and comments", () => {
  assert.equal(
    report(document, { interval: "2026-11" }),
    [
      "November 2026-11: [4] ",
      "  Week #46: [4] ",
      "    Tue 2026-11-10: [2] Architecture; Review",
      "    Wed 2026-11-11: [2] Implementation",
    ].join("\n"),
  );
});

test("Softwaretechnik export groups each day and uses Todo directives", () => {
  assert.equal(
    softwaretechnik(document, { interval: "2026-11" }),
    [
      "-",
      "  date: 2026-11-10",
      "  timeInHrs: 2",
      "  client: Acme",
      "  project: Planning",
      "  billable: true",
      "  comment: Architecture; Review",
      "-",
      "  date: 2026-11-11",
      "  timeInHrs: 2",
      "  client: Acme",
      "  project: Planning",
      "  billable: true",
      "  comment: Implementation",
    ].join("\n"),
  );
});

test("simple export reconstructs canonical entry lines", () => {
  assert.equal(
    simple(document, { interval: "2026-11" }),
    [
      "2026-11-10 - 1.5 - Architecture",
      "2026-11-10 - 0.5 - Review",
      "2026-11-11 - 2 - Implementation",
    ].join("\n"),
  );
});
