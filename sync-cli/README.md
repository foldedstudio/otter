# @otter/sync-cli

The thin CLI from `otter.harness.yaml`'s "How the layers compose" section: reads a product repo's `otter.yaml`, merges org → stack → repo by the precedence rules, and writes the files each agent tool expects.

## Usage

```
otter-sync sync  --repo <product-repo-path> --harness <otter-repo-path>
otter-sync check --repo <product-repo-path> --harness <otter-repo-path>
```

Both default `--repo` and `--harness` to the current directory. `sync` writes `AGENTS.md`, a `CLAUDE.md` symlink to it, and `.claude/settings.json` + `.claude/skills/`. `check` compares those files against what a fresh sync would produce and exits non-zero if they differ — that's the drift check CI runs on every pull request.

## What it does and doesn't merge

- **Guardrails** (`deny`, `require_approval`, `protected_paths`) union across org and stack (and repo for `protected_paths`) — a restriction at any layer applies everywhere. `tools_allowlist` and `mcp_servers_allowlist` come from the org layer only.
- **Guidance/instructions** concatenate in load order (org, stack, repo) under a heading per layer, so the most specific layer's text reads last.
- **Skills** are merged namespaced (`org:open-pr`, `stack:add-ui-component`) — every layer's skills are kept, never overwritten, written out as `.claude/skills/<namespace>-<name>.md`.
- **The developer layer is intentionally not part of `sync`/`check`.** Per the plan, personal settings are never committed, and the committed output must be exactly what CI's sync (which has no developer home directory) would produce. A developer's personal `~/.otter/developer.md` isn't wired in yet — see `otter.harness.yaml` for the layer's intended scope if you pick this up.

## Known gaps (first cut, Phase 1)

- The guardrail-label → Claude Code permission-rule mapping in `src/writeOutputs.js` (`DENY_PATTERNS`/`ASK_PATTERNS`) is a draft. Validate it against current Claude Code permission settings before treating it as the sole enforcement for a guardrail.
- Skills are written as flat `.md` files, not the directory-with-`SKILL.md` layout Claude Code skills typically use. Fine for Codex/AGENTS.md consumers; revisit before relying on this for Claude Code's own skill discovery.
- No Codex-specific output yet — Codex reads `AGENTS.md` directly, which this CLI already produces correctly.

## Tests

```
npm install
npm test
```

`test/sync.test.js` runs the CLI's actual load/merge/write/check path against the real `org/` and `stacks/typescript-nextjs/` layers in this repo, so it doubles as a check that those layers parse and merge cleanly.
