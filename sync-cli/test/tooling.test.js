import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkToolingCompliance } from "../src/check.js";

const tooling = {
  version_manager: "mise",
  version_manager_config: ".mise.toml",
  package_manager: "pnpm",
  lockfile: "pnpm-lock.yaml",
  forbidden_lockfiles: ["package-lock.json", "yarn.lock"],
};

test("no tooling block declared means nothing to enforce", () => {
  assert.deepEqual(checkToolingCompliance({ tooling: null }, { repoPath: "/anything" }), []);
});

test("flags a repo missing mise config, lockfile, and packageManager field", () => {
  const repoPath = mkdtempSync(path.join(tmpdir(), "otter-tooling-test-"));
  try {
    const diffs = checkToolingCompliance({ tooling }, { repoPath });
    assert.ok(diffs.some((d) => d.path === ".mise.toml"));
    assert.ok(diffs.some((d) => d.path === "pnpm-lock.yaml"));
  } finally {
    rmSync(repoPath, { recursive: true, force: true });
  }
});

test("flags a forbidden lockfile from the wrong package manager", () => {
  const repoPath = mkdtempSync(path.join(tmpdir(), "otter-tooling-test-"));
  try {
    writeFileSync(path.join(repoPath, "package-lock.json"), "{}");
    const diffs = checkToolingCompliance({ tooling }, { repoPath });
    assert.ok(diffs.some((d) => d.path === "package-lock.json"));
  } finally {
    rmSync(repoPath, { recursive: true, force: true });
  }
});

test("flags package.json missing or mismatched packageManager field", () => {
  const repoPath = mkdtempSync(path.join(tmpdir(), "otter-tooling-test-"));
  try {
    writeFileSync(path.join(repoPath, "package.json"), JSON.stringify({ name: "x" }));
    let diffs = checkToolingCompliance({ tooling }, { repoPath });
    assert.ok(diffs.some((d) => d.path === "package.json"));

    writeFileSync(path.join(repoPath, "package.json"), JSON.stringify({ packageManager: "npm@10.0.0" }));
    diffs = checkToolingCompliance({ tooling }, { repoPath });
    assert.ok(diffs.some((d) => d.path === "package.json"));
  } finally {
    rmSync(repoPath, { recursive: true, force: true });
  }
});

test("a fully compliant repo gets no diffs", () => {
  const repoPath = mkdtempSync(path.join(tmpdir(), "otter-tooling-test-"));
  try {
    writeFileSync(path.join(repoPath, ".mise.toml"), "[tools]\nnode = \"22\"\n");
    writeFileSync(path.join(repoPath, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
    writeFileSync(path.join(repoPath, "package.json"), JSON.stringify({ packageManager: "pnpm@10.7.1" }));
    assert.deepEqual(checkToolingCompliance({ tooling }, { repoPath }), []);
  } finally {
    rmSync(repoPath, { recursive: true, force: true });
  }
});
