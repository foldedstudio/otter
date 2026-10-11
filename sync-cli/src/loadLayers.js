import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { parse as parseYaml } from "yaml";

function readSkillsDir(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ name: f.replace(/\.md$/, ""), path: path.join(dir, f) }));
}

function readIfExists(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : null;
}

export function loadOrgLayer(harnessPath) {
  const dir = path.join(harnessPath, "org");
  const config = parseYaml(readFileSync(path.join(dir, "org.yaml"), "utf8"));
  return {
    id: "org",
    instructions: readIfExists(path.join(dir, config.instructions ?? "AGENTS.md")),
    guardrails: {
      deny: config.guardrails?.deny ?? [],
      require_approval: config.guardrails?.require_approval ?? [],
      protected_paths: config.guardrails?.protected_paths ?? [],
      tools_allowlist: config.guardrails?.tools_allowlist ?? [],
      mcp_servers_allowlist: config.guardrails?.mcp_servers_allowlist ?? [],
    },
    skills: readSkillsDir(path.join(dir, "skills")),
  };
}

export function loadStackLayer(harnessPath, stackName) {
  const dir = path.join(harnessPath, "stacks", stackName);
  if (!existsSync(dir)) {
    throw new Error(`Unknown stack "${stackName}" — no folder at ${dir}`);
  }
  const config = parseYaml(readFileSync(path.join(dir, "stack.yaml"), "utf8"));
  return {
    id: "stack",
    name: stackName,
    instructions: readIfExists(path.join(dir, config.instructions ?? "AGENTS.md")),
    commands: config.commands ?? {},
    tooling: config.tooling ?? null,
    guardrails: {
      deny: config.guardrails?.deny ?? [],
      require_approval: config.guardrails?.require_approval ?? [],
      protected_paths: config.guardrails?.protected_paths ?? [],
    },
    skills: readSkillsDir(path.join(dir, "skills")),
  };
}

export function loadRepoLayer(repoPath) {
  const manifestPath = path.join(repoPath, "otter.yaml");
  if (!existsSync(manifestPath)) {
    throw new Error(`No otter.yaml manifest at ${manifestPath}`);
  }
  const manifest = parseYaml(readFileSync(manifestPath, "utf8"));
  const instructionsDir = manifest.local?.instructions
    ? path.join(repoPath, manifest.local.instructions)
    : null;

  let instructions = null;
  if (instructionsDir && existsSync(instructionsDir)) {
    const files = readdirSync(instructionsDir)
      .filter((f) => f.endsWith(".md"))
      .sort();
    instructions = files
      .map((f) => readFileSync(path.join(instructionsDir, f), "utf8"))
      .join("\n\n");
  }

  return {
    id: "repo",
    manifest,
    instructions,
    guardrails: {
      protected_paths: manifest.local?.protected_paths ?? [],
    },
    skills: [],
  };
}

export function loadDeveloperLayer(home = path.join(os.homedir(), ".otter")) {
  const filePath = path.join(home, "developer.md");
  const instructions = readIfExists(filePath);
  if (instructions === null) return null;
  return { id: "developer", instructions, guardrails: {}, skills: [] };
}
