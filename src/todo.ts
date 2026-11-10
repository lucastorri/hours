import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { isUnknownRecord } from "./guards.ts";
import type { HoursDocument } from "./types.ts";

const isDirective = (value: unknown): boolean =>
  isUnknownRecord(value) &&
  Number.isInteger(value["line"]) &&
  typeof value["name"] === "string" &&
  typeof value["value"] === "string";

const isEntry = (value: unknown): boolean =>
  isUnknownRecord(value) &&
  Number.isInteger(value["line"]) &&
  typeof value["date"] === "string" &&
  typeof value["hours"] === "number" &&
  Number.isFinite(value["hours"]) &&
  typeof value["description"] === "string";

const isSource = (value: unknown): boolean => {
  if (!isUnknownRecord(value)) return false;
  if (value["kind"] === "stdin") return true;
  return value["kind"] === "vault" && typeof value["path"] === "string";
};

export const parseTodoHours = (text: string): HoursDocument => {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("todo hours returned invalid JSON");
  }
  if (
    !isUnknownRecord(value) ||
    value["version"] !== 1 ||
    !isSource(value["source"]) ||
    !Array.isArray(value["directives"]) ||
    !value["directives"].every(isDirective) ||
    !Array.isArray(value["entries"]) ||
    !value["entries"].every(isEntry)
  ) {
    throw new Error("todo hours returned an unsupported JSON contract; expected version 1");
  }
  return value as HoursDocument;
};

const invokeTodo = (args: readonly string[], input?: string): HoursDocument => {
  const executable = process.env["TODO_BIN"] ?? "todo";
  const result = spawnSync(executable, [...args], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    ...(input === undefined ? {} : { input }),
  });
  if (result.error !== undefined) throw result.error;
  if (result.status !== 0) {
    const reason = result.stderr.trim() || `todo exited with status ${result.status ?? "unknown"}`;
    throw new Error(reason);
  }
  return parseTodoHours(result.stdout);
};

/** Ask Todo to resolve and parse a report already in the configured vault. */
export const loadVaultHours = (reference: string): HoursDocument =>
  invokeTodo(["hours", "show", reference, "--json"]);

/** Read an arbitrary host file here, then give only its bytes to Todo's parser on stdin. */
export const loadFileHours = async (path: string): Promise<HoursDocument> =>
  invokeTodo(["hours", "parse"], await readFile(path, "utf8"));
