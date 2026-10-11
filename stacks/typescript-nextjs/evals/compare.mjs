#!/usr/bin/env node
// Release gate: `otter_release.block-if-eval-success-drops` in
// otter.harness.yaml. Compares two run.mjs --json reports and exits non-zero
// if the candidate harness passes fewer tasks than the current one.
//
//   node compare.mjs current.json candidate.json

import { readFileSync } from "node:fs";

const [currentPath, candidatePath] = process.argv.slice(2);
if (!currentPath || !candidatePath) {
  console.error("Usage: node compare.mjs <current.json> <candidate.json>");
  process.exit(2);
}

const current = JSON.parse(readFileSync(currentPath, "utf8"));
const candidate = JSON.parse(readFileSync(candidatePath, "utf8"));
const currentById = new Map(current.tasks.map((t) => [t.id, t.pass]));

console.log(`current:   ${current.passed}/${current.total}`);
console.log(`candidate: ${candidate.passed}/${candidate.total}`);
for (const t of candidate.tasks) {
  const before = currentById.get(t.id);
  if (before === true && !t.pass) console.log(`  regressed: ${t.id}`);
  if (before === false && t.pass) console.log(`  fixed:     ${t.id}`);
  if (before === undefined) console.log(`  new:       ${t.id} (${t.pass ? "pass" : "fail"})`);
}

// Both reports come from the same task set (CI runs this checkout's tasks
// against each harness), so pass counts compare directly.
if (candidate.total !== current.total) {
  console.error("\nReports cover different task sets — run both with the same tasks/.");
  process.exit(2);
}
if (candidate.passed < current.passed) {
  console.error("\nEval success dropped versus the current harness — blocking release.");
  process.exit(1);
}
console.log("\nEval success held or improved.");
