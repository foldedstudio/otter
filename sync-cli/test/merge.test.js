import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeGuardrails, mergeSkills, mergeInstructions } from "../src/merge.js";

function layer(id, overrides = {}) {
  return {
    id,
    instructions: null,
    guardrails: { deny: [], require_approval: [], protected_paths: [], tools_allowlist: [], mcp_servers_allowlist: [] },
    skills: [],
    ...overrides,
  };
}

test("guardrails union across layers, a restriction anywhere applies everywhere", () => {
  const org = layer("org", { guardrails: { deny: ["destructive-commands"], require_approval: [], protected_paths: [], tools_allowlist: ["claude-code"], mcp_servers_allowlist: [] } });
  const stack = layer("stack", { guardrails: { deny: [], require_approval: [], protected_paths: ["generated/"] } });
  const repo = layer("repo", { guardrails: { protected_paths: [".env*"] } });

  const result = mergeGuardrails(org, stack, repo);

  assert.deepEqual(result.deny, ["destructive-commands"]);
  assert.deepEqual(result.protected_paths, ["generated/", ".env*"]);
  assert.deepEqual(result.tools_allowlist, ["claude-code"]);
});

test("guardrails dedupe when the same restriction appears at two layers", () => {
  const org = layer("org", { guardrails: { deny: [], require_approval: [], protected_paths: ["generated/"], tools_allowlist: [], mcp_servers_allowlist: [] } });
  const stack = layer("stack", { guardrails: { deny: [], require_approval: [], protected_paths: ["generated/"] } });
  const repo = layer("repo", { guardrails: { protected_paths: [] } });

  const result = mergeGuardrails(org, stack, repo);

  assert.deepEqual(result.protected_paths, ["generated/"]);
});

test("skills are merged namespaced, never collide", () => {
  const org = layer("org", { skills: [{ name: "open-pr", path: "/org/skills/open-pr.md" }] });
  const stack = layer("stack", { skills: [{ name: "open-pr", path: "/stack/skills/open-pr.md" }] });
  const repo = layer("repo");

  const result = mergeSkills(org, stack, repo);

  assert.deepEqual(result, [
    { namespace: "org", name: "open-pr", path: "/org/skills/open-pr.md" },
    { namespace: "stack", name: "open-pr", path: "/stack/skills/open-pr.md" },
  ]);
});

test("instructions concatenate in load order, most specific last", () => {
  const org = layer("org", { instructions: "Org guidance." });
  const stack = layer("stack", { name: "typescript-nextjs", instructions: "Stack guidance." });
  const repo = layer("repo", { instructions: "Repo guidance." });

  const sections = mergeInstructions(org, stack, repo);

  assert.deepEqual(sections.map((s) => s.id), ["org", "stack", "repo"]);
  assert.equal(sections[sections.length - 1].text, "Repo guidance.");
});

test("instructions skip layers that have none", () => {
  const org = layer("org", { instructions: "Org guidance." });
  const stack = layer("stack", { name: "typescript-nextjs", instructions: null });
  const repo = layer("repo", { instructions: null });

  const sections = mergeInstructions(org, stack, repo);

  assert.deepEqual(sections.map((s) => s.id), ["org"]);
});
