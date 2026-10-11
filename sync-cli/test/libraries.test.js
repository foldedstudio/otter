import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkBannedLibraries } from "../src/check.js";

const libraries = {
  preferred: [],
  banned: [
    { name: "moment", reason: "use date-fns" },
    { name: "lodash", reason: "use modern JS" },
  ],
};

function withRepo(pkg, fn) {
  const repoPath = mkdtempSync(path.join(tmpdir(), "otter-libraries-test-"));
  try {
    if (pkg) writeFileSync(path.join(repoPath, "package.json"), JSON.stringify(pkg));
    return fn(repoPath);
  } finally {
    rmSync(repoPath, { recursive: true, force: true });
  }
}

test("flags banned libraries in dependencies and devDependencies", () => {
  withRepo({ dependencies: { moment: "^2.30.0", zod: "^3.0.0" }, devDependencies: { lodash: "^4.17.21" } }, (repoPath) => {
    const diffs = checkBannedLibraries({ libraries }, { repoPath });
    assert.equal(diffs.length, 2);
    assert.ok(diffs.some((d) => d.reason.includes('"moment"')));
    assert.ok(diffs.some((d) => d.reason.includes('"lodash"')));
  });
});

test("matches exact package names only", () => {
  withRepo({ dependencies: { "momentum-slider": "^1.0.0", "@acme/lodash-helpers": "^1.0.0" } }, (repoPath) => {
    assert.deepEqual(checkBannedLibraries({ libraries }, { repoPath }), []);
  });
});

test("no package.json or no banned list means nothing to enforce", () => {
  withRepo(null, (repoPath) => {
    assert.deepEqual(checkBannedLibraries({ libraries }, { repoPath }), []);
  });
  withRepo({ dependencies: { moment: "^2.30.0" } }, (repoPath) => {
    assert.deepEqual(checkBannedLibraries({ libraries: { banned: [] } }, { repoPath }), []);
  });
});
