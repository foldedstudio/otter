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
