import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, cpSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadOrgLayer, loadStackLayer, loadRepoLayer } from "../src/loadLayers.js";
import { merge } from "../src/merge.js";
import { writeOutputs } from "../src/writeOutputs.js";
import { checkDrift } from "../src/check.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const harnessPath = path.resolve(here, "../.."); // this otter repo: has org/ and stacks/
const fixtureRepo = path.join(here, "fixtures/sample-repo");

function syncInto(repoPath) {
  const org = loadOrgLayer(harnessPath);
  const stack = loadStackLayer(harnessPath, "typescript-nextjs");
  const repo = loadRepoLayer(repoPath);
  const merged = merge({ org, stack, repo });
  const ctx = { repoPath, otterVersion: "v0.1.0", stackName: "typescript-nextjs" };
  return { merged, ctx };
}

test("sync writes AGENTS.md, CLAUDE.md symlink, and claude settings/skills", () => {
  const workdir = mkdtempSync(path.join(tmpdir(), "otter-sync-test-"));
  try {
    cpSync(fixtureRepo, workdir, { recursive: true });
    const { merged, ctx } = syncInto(workdir);
    writeOutputs(merged, ctx);

    const agents = readFileSync(path.join(workdir, "AGENTS.md"), "utf8");
    assert.match(agents, /## Organisation/);
    assert.match(agents, /## Stack: typescript-nextjs/);
    assert.match(agents, /## Repo/);
    assert.match(agents, /small internal dashboard/); // repo-local instructions made it in

    assert.ok(existsSync(path.join(workdir, "CLAUDE.md")));
    assert.ok(existsSync(path.join(workdir, ".claude/settings.json")));
    const settings = JSON.parse(readFileSync(path.join(workdir, ".claude/settings.json"), "utf8"));
    assert.ok(settings.permissions.deny.length > 0);
    assert.ok(existsSync(path.join(workdir, ".claude/skills/org-open-pr.md")));
    assert.ok(existsSync(path.join(workdir, ".claude/skills/stack-add-ui-component.md")));
  } finally {
    rmSync(workdir, { recursive: true, force: true });
  }
});

test("check reports no drift right after a sync, and flags drift once a file is edited", () => {
  const workdir = mkdtempSync(path.join(tmpdir(), "otter-sync-test-"));
  try {
    cpSync(fixtureRepo, workdir, { recursive: true });
    const { merged, ctx } = syncInto(workdir);
    writeOutputs(merged, ctx);

    assert.deepEqual(checkDrift(merged, ctx), []);

    writeFileSync(path.join(workdir, "AGENTS.md"), "hand-edited, should be flagged\n");
    const diffs = checkDrift(merged, ctx);
    assert.ok(diffs.some((d) => d.path === "AGENTS.md"));
  } finally {
    rmSync(workdir, { recursive: true, force: true });
  }
});

test("repo-level protected_paths flow into the merged guardrails", () => {
  const workdir = mkdtempSync(path.join(tmpdir(), "otter-sync-test-"));
  try {
    cpSync(fixtureRepo, workdir, { recursive: true });
    const { merged } = syncInto(workdir);
    assert.ok(merged.guardrails.protected_paths.includes("generated/"));
    assert.ok(merged.guardrails.protected_paths.includes(".env*"));
  } finally {
    rmSync(workdir, { recursive: true, force: true });
  }
});
