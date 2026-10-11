# Otter

Otter is a three-layer AI development harness that Claude Code and Codex run inside: **organisation** (`org/`), **stack** (`stacks/<name>/`), and **local** (per product repo). This repo is the harness itself — the source that a sync CLI will merge and write out as each product repo's `AGENTS.md` and Claude Code files.

Full plan: `plans/otter-plan.md` (narrative) and `plans/otter.harness.yaml` (the plan as config — treat this as the spec). Start with `plans/README.md`.

## Current state

Phase 1 (Build), pre-code. Only `plans/` exists so far. Still to scaffold, per `otter.harness.yaml`:

- `org/` — guardrails, permission defaults, shared skills, `org/AGENTS.md` (capped at 150 lines)
- `stacks/typescript-nextjs/` — commands, conventions, approved libraries, skills, templates, evals
- The sync CLI — reads a product repo's `otter.yaml`, merges org → stack → repo → developer by precedence, writes `AGENTS.md` and the Claude Code files
- A drift check so CI fails when committed agent files differ from a fresh sync
- The first 10–15 eval tasks, run headless through Claude Code in CI

There is no build, lint, or test command yet — don't invent one. Check `package.json`/`otter.harness.yaml` before assuming tooling exists.

## Working in this repo

- Treat `otter.harness.yaml` as the source of truth for structure and naming; if a change contradicts it, update the yaml and the plan together, don't drift from it silently.
- `TODO` markers in `otter.harness.yaml` are open decisions, not placeholders to invent values for — resolve them deliberately or leave them.
- Guardrails (security, permissions, tool allowlist) only tighten as they flow from org → stack → repo → developer; never loosen one at a lower layer.
- Conventional commits; small PRs with a clear description; every change ships with tests or a reason why not (per the org guidance in the plan).
- This file (`AGENTS.md`) is the shared core other agent tools read. `CLAUDE.md` is a symlink to it — edit `AGENTS.md`, never `CLAUDE.md` directly.
