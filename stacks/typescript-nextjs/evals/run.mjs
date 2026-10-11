#!/usr/bin/env node
// Headless eval runner for the typescript-nextjs stack pack.
// Copies fixtures/base-app per task, syncs the harness under test into it,
// runs the task prompt through `claude -p`, then checks the result. See
// README.md for the task format.

import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const here = path.dirname(fileURLToPath(import.meta.url));
const tasksDir = path.join(here, "tasks");
const fixtureDir = path.join(here, "fixtures/base-app");
// Always this checkout's sync CLI, so current and candidate harnesses are
// compared with the same tooling and only their layers differ.
const syncCli = path.join(here, "../../../sync-cli/bin/otter-sync.js");

const { requestedId, harness, jsonOut } = parseArgs(process.argv.slice(2));
const taskFiles = readdirSync(tasksDir)
  .filter((f) => f.endsWith(".yaml"))
  .filter((f) => !requestedId || f === `${requestedId}.yaml`);

if (taskFiles.length === 0) {
  console.error(requestedId ? `No task named "${requestedId}"` : "No tasks found");
  process.exit(1);
}

let failures = 0;
const report = [];

for (const file of taskFiles) {
  const task = parseYaml(readFileSync(path.join(tasksDir, file), "utf8"));
  const workdir = mkdtempSync(path.join(tmpdir(), `otter-eval-${task.id}-`));
  cpSync(fixtureDir, workdir, { recursive: true });

  const needsInstall = task.checks.some((c) => c.type === "command");
  if (needsInstall) {
    execFileSync("pnpm", ["install", "--silent"], {
      cwd: workdir,
      stdio: "inherit",
    });
  }

  execFileSync("node", [syncCli, "sync", "--repo", workdir, "--harness", harness], {
    stdio: ["ignore", "ignore", "inherit"],
  });

  let agentError = null;
  try {
    execFileSync(
      "claude",
      ["-p", task.prompt, "--permission-mode", "acceptEdits", "--output-format", "json"],
      { cwd: workdir, stdio: ["ignore", "pipe", "inherit"] },
    );
  } catch (err) {
    agentError = `claude exited with ${err.status ?? err.message}`;
  }

  const results = agentError
    ? [{ pass: false, detail: agentError }]
    : task.checks.map((check) => runCheck(check, workdir));
  const ok = results.every((r) => r.pass);
  report.push({ id: task.id, pass: ok, failed: results.filter((r) => !r.pass).map((r) => r.detail) });
  console.log(`${ok ? "PASS" : "FAIL"}  ${task.id}  — ${task.description}`);
  for (const r of results) {
    if (!r.pass) console.log(`   ✗ ${r.detail}`);
  }
  if (!ok) failures++;

  rmSync(workdir, { recursive: true, force: true });
}

console.log(`\n${taskFiles.length - failures}/${taskFiles.length} tasks passed (harness: ${harness})`);
if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify({ harness, passed: taskFiles.length - failures, total: taskFiles.length, tasks: report }, null, 2) + "\n");
}
process.exit(failures > 0 ? 1 : 0);

function parseArgs(argv) {
  const opts = { requestedId: undefined, harness: path.resolve(here, "../../.."), jsonOut: undefined };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--harness") opts.harness = path.resolve(argv[++i]);
    else if (argv[i] === "--json") opts.jsonOut = path.resolve(argv[++i]);
    else if (!argv[i].startsWith("--") && !opts.requestedId) opts.requestedId = argv[i];
    else {
      console.error(`Unknown argument: ${argv[i]}`);
      process.exit(2);
    }
  }
  return opts;
}

function runCheck(check, workdir) {
  switch (check.type) {
    case "file-exists": {
      const pass = existsSync(path.join(workdir, check.path));
      return { pass, detail: `expected ${check.path} to exist` };
    }
    case "file-not-exists": {
      const pass = !existsSync(path.join(workdir, check.path));
      return { pass, detail: `expected ${check.path} not to exist` };
    }
    case "file-contains":
    case "file-not-contains": {
      const filePath = path.join(workdir, check.path);
      if (!existsSync(filePath)) {
        return { pass: check.type === "file-not-contains", detail: `${check.path} does not exist` };
      }
      const contents = readFileSync(filePath, "utf8");
      const matches = new RegExp(check.pattern).test(contents);
      const pass = check.type === "file-contains" ? matches : !matches;
      return { pass, detail: `expected ${check.path} ${check.type === "file-contains" ? "to" : "not to"} match /${check.pattern}/` };
    }
    case "command": {
      try {
        execFileSync(check.run, { cwd: workdir, shell: true, stdio: "pipe" });
        return { pass: true, detail: "" };
      } catch {
        return { pass: false, detail: `command failed: ${check.run}` };
      }
    }
    default:
      return { pass: false, detail: `unknown check type: ${check.type}` };
  }
}
