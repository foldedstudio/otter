#!/usr/bin/env node
import path from "node:path";
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { loadOrgLayer, loadStackLayer, loadRepoLayer } from "../src/loadLayers.js";
import { merge } from "../src/merge.js";
import { writeOutputs } from "../src/writeOutputs.js";
import { checkDrift } from "../src/check.js";

function usage() {
  console.error(
    [
      "Usage: otter-sync <sync|check> [options]",
      "",
      "  --repo <path>      Product repo to sync (default: cwd)",
      "  --harness <path>   Path to the otter harness repo (default: cwd)",
      "",
      "Reads <repo>/otter.yaml to resolve the pinned otter version and stack,",
      "then writes AGENTS.md, CLAUDE.md, and .claude/settings.json + skills/",
      "(sync) or reports whether those files are out of date (check).",
    ].join("\n"),
  );
}

function parseArgs(argv) {
  const command = argv[0];
  const opts = { repo: process.cwd(), harness: process.cwd() };
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === "--repo") opts.repo = argv[++i];
    else if (argv[i] === "--harness") opts.harness = argv[++i];
    else {
      console.error(`Unknown argument: ${argv[i]}`);
      usage();
      process.exit(2);
    }
  }
  return { command, opts };
}

function run() {
  const { command, opts } = parseArgs(process.argv.slice(2));
  if (command !== "sync" && command !== "check") {
    usage();
    process.exit(2);
  }

  const repoPath = path.resolve(opts.repo);
  const harnessPath = path.resolve(opts.harness);
  const manifest = parseYaml(readFileSync(path.join(repoPath, "otter.yaml"), "utf8"));

  const org = loadOrgLayer(harnessPath);
  const stack = loadStackLayer(harnessPath, manifest.stack);
  const repo = loadRepoLayer(repoPath);
  const merged = merge({ org, stack, repo });

  const ctx = { repoPath, otterVersion: manifest.otter, stackName: manifest.stack };

  if (command === "sync") {
    const { files } = writeOutputs(merged, ctx);
    console.log(`Synced ${files.length} outputs from otter ${manifest.otter} / ${manifest.stack}:`);
    for (const f of files) console.log(`  ${path.relative(repoPath, f)}`);
    return;
  }

  const diffs = checkDrift(merged, ctx);
  if (diffs.length === 0) {
    console.log("In sync — committed files match a fresh sync.");
    return;
  }
  console.error(`${diffs.length} file(s) differ from a fresh sync:`);
  for (const d of diffs) console.error(`  ${d.path}: ${d.reason}`);
  process.exitCode = 1;
}

run();
