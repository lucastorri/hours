import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { loadFileHours, loadVaultHours, parseTodoHours } from "../src/todo.ts";

const response = JSON.stringify({
  version: 1,
  source: { kind: "stdin" },
  directives: [{ line: 1, name: "client", value: "Acme" }],
  entries: [{ line: 2, date: "2026-11-10", hours: 1.5, description: "Review" }],
});

test("the adapter rejects malformed and unknown Todo contracts", () => {
  assert.throws(() => parseTodoHours("not json"), /invalid JSON/);
  assert.throws(() => parseTodoHours('{"version":2}'), /expected version 1/);
});

test("external paths stay in hours while vault references go directly to Todo", async () => {
  const root = await mkdtemp(join(tmpdir(), "hours-adapter-"));
  const fakeTodo = join(root, "todo");
  const calls = join(root, "calls.jsonl");
  const external = join(root, "outside.hours");
  await writeFile(
    fakeTodo,
    `#!/usr/bin/env node
const fs = require("node:fs");
const input = fs.readFileSync(0, "utf8");
fs.appendFileSync(${JSON.stringify(calls)}, JSON.stringify({ args: process.argv.slice(2), input }) + "\\n");
process.stdout.write(${JSON.stringify(response)});
`,
  );
  await chmod(fakeTodo, 0o755);
  await writeFile(external, "2026-11-10 - 1.5 - Review\n");

  const previous = process.env["TODO_BIN"];
  process.env["TODO_BIN"] = fakeTodo;
  try {
    assert.equal((await loadFileHours(external)).version, 1);
    assert.equal(loadVaultHours("Work/Client").version, 1);
  } finally {
    if (previous === undefined) delete process.env["TODO_BIN"];
    else process.env["TODO_BIN"] = previous;
  }

  const [fileCall, vaultCall] = (await readFile(calls, "utf8"))
    .trim()
    .split("\n")
    .map(
      (line) => JSON.parse(line) as { readonly args: readonly string[]; readonly input: string },
    );
  assert.deepEqual(fileCall, {
    args: ["hours", "parse"],
    input: "2026-11-10 - 1.5 - Review\n",
  });
  assert.deepEqual(vaultCall, {
    args: ["hours", "show", "Work/Client", "--json"],
    input: "",
  });

  await rm(root, { recursive: true, force: true });
});

test("the CLI keeps the old export shape and delegates parsing", async () => {
  const root = await mkdtemp(join(tmpdir(), "hours-cli-"));
  const fakeTodo = join(root, "todo");
  const external = join(root, "project.hours");
  await writeFile(
    fakeTodo,
    `#!/usr/bin/env node
process.stdin.resume();
process.stdin.on("end", () => process.stdout.write(${JSON.stringify(response)}));
`,
  );
  await chmod(fakeTodo, 0o755);
  await writeFile(external, "ignored by fake parser\n");

  const result = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--disable-warning=ExperimentalWarning",
      resolve("src/cli.ts"),
      "--input",
      external,
      "export",
      "simple",
    ],
    { encoding: "utf8", env: { ...process.env, TODO_BIN: fakeTodo } },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "2026-11-10 - 1.5 - Review\n");
  await rm(root, { recursive: true, force: true });
});
