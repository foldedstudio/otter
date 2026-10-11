#!/usr/bin/env node
// Headless eval runner for the typescript-nextjs stack pack.
// Copies fixtures/base-app per task, runs the task prompt through
// `claude -p`, then checks the result. See README.md for the task format.

import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const here = path.dirname(fileURLToPath(import.meta.url));
const tasksDir = path.join(here, "tasks");
const fixtureDir = path.join(here, "fixtures/base-app");

const requestedId = process.argv[2];
const taskFiles = readdirSync(tasksDir)
  .filter((f) => f.endsWith(".yaml"))
  .filter((f) => !requestedId || f === `${requestedId}.yaml`);

if (taskFiles.length === 0) {
  console.error(requestedId ? `No task named "${requestedId}"` : "No tasks found");
  process.exit(1);
}

let failures = 0;

for (const file of taskFiles) {
  const task = parseYaml(readFileSync(path.join(tasksDir, file), "utf8"));
  const workdir = mkdtempSync(path.join(tmpdir(), `otter-eval-${task.id}-`));
  cpSync(fixtureDir, workdir, { recursive: true });

  const needsNpm = task.checks.some((c) => c.type === "command");
  if (needsNpm) {
    execFileSync("npm", ["install", "--no-audit", "--no-fund", "--silent"], {
      cwd: workdir,
      stdio: "inherit",
    });
  }

  execFileSync(
    "claude",
    ["-p", task.prompt, "--permission-mode", "acceptEdits", "--output-format", "json"],
    { cwd: workdir, stdio: ["ignore", "pipe", "inherit"] },
  );

  const results = task.checks.map((check) => runCheck(check, workdir));
  const ok = results.every((r) => r.pass);
  console.log(`${ok ? "PASS" : "FAIL"}  ${task.id}  — ${task.description}`);
  for (const r of results) {
    if (!r.pass) console.log(`   ✗ ${r.detail}`);
  }
  if (!ok) failures++;

  rmSync(workdir, { recursive: true, force: true });
}

console.log(`\n${taskFiles.length - failures}/${taskFiles.length} tasks passed`);
process.exit(failures > 0 ? 1 : 0);

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
