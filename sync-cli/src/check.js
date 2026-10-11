import { readFileSync, existsSync, readlinkSync, readdirSync } from "node:fs";
import path from "node:path";
import { renderAgentsMd, renderClaudeSettings } from "./writeOutputs.js";

// Compares what a fresh sync would produce against what's committed, without
// writing anything. Returns a list of { path, reason } for anything that
// differs — empty list means the repo is in sync.
export function checkDrift(merged, { repoPath, otterVersion, stackName }) {
  const diffs = [];

  const agentsPath = path.join(repoPath, "AGENTS.md");
  const expectedAgents = renderAgentsMd(merged, { otterVersion, stackName });
  if (!existsSync(agentsPath)) {
    diffs.push({ path: "AGENTS.md", reason: "missing" });
  } else if (readFileSync(agentsPath, "utf8") !== expectedAgents) {
    diffs.push({ path: "AGENTS.md", reason: "content differs from a fresh sync" });
  }

  const claudePath = path.join(repoPath, "CLAUDE.md");
  if (!existsSync(claudePath)) {
    diffs.push({ path: "CLAUDE.md", reason: "missing" });
  } else {
    try {
      if (readlinkSync(claudePath) !== "AGENTS.md") {
        diffs.push({ path: "CLAUDE.md", reason: "should symlink to AGENTS.md" });
      }
    } catch {
      diffs.push({ path: "CLAUDE.md", reason: "should be a symlink to AGENTS.md" });
    }
  }

  const settingsPath = path.join(repoPath, ".claude/settings.json");
  const expectedSettings = JSON.stringify(renderClaudeSettings(merged), null, 2) + "\n";
  if (!existsSync(settingsPath)) {
    diffs.push({ path: ".claude/settings.json", reason: "missing" });
  } else if (readFileSync(settingsPath, "utf8") !== expectedSettings) {
    diffs.push({ path: ".claude/settings.json", reason: "content differs from a fresh sync" });
  }

  const skillsDir = path.join(repoPath, ".claude/skills");
  const expectedSkillFiles = new Set(merged.skills.map((s) => `${s.namespace}-${s.name}.md`));
  const actualSkillFiles = new Set(existsSync(skillsDir) ? readdirSync(skillsDir) : []);
  for (const f of expectedSkillFiles) {
    if (!actualSkillFiles.has(f)) diffs.push({ path: `.claude/skills/${f}`, reason: "missing" });
  }
  for (const f of actualSkillFiles) {
    if (!expectedSkillFiles.has(f)) diffs.push({ path: `.claude/skills/${f}`, reason: "stale — no longer produced by a sync" });
  }

  return diffs;
}

// Enforces a stack's required dev tooling (stack.yaml's `tooling` block),
// not just the generated files above. A stack can be in sync on AGENTS.md
// etc. and still be missing the lockfile/version-manager config it requires,
// so this is checked separately and reported alongside drift.
export function checkToolingCompliance(merged, { repoPath }) {
  const tooling = merged.tooling;
  if (!tooling) return [];
  const diffs = [];

  if (tooling.version_manager_config && !existsSync(path.join(repoPath, tooling.version_manager_config))) {
    diffs.push({
      path: tooling.version_manager_config,
      reason: `required by this stack's tooling policy (${tooling.version_manager})`,
    });
  }

  if (tooling.lockfile && !existsSync(path.join(repoPath, tooling.lockfile))) {
    diffs.push({ path: tooling.lockfile, reason: `required lockfile for ${tooling.package_manager} is missing` });
  }

  for (const forbidden of tooling.forbidden_lockfiles ?? []) {
    if (existsSync(path.join(repoPath, forbidden))) {
      diffs.push({
        path: forbidden,
        reason: `forbidden — this stack requires ${tooling.package_manager}, not the package manager that produced this lockfile`,
      });
    }
  }

  if (tooling.package_manager) {
    const pkgPath = path.join(repoPath, "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      if (!pkg.packageManager?.startsWith(`${tooling.package_manager}@`)) {
        diffs.push({
          path: "package.json",
          reason: `"packageManager" field must pin ${tooling.package_manager}@<version>`,
        });
      }
    }
  }

  return diffs;
}
