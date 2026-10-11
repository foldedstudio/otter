# Otter

Otter is a three-layer AI development harness that Claude Code and Codex run inside: **organisation** (`org/`), **stack** (`stacks/<name>/`), and **local** (per product repo). This repo is the harness itself — the source that a sync CLI will merge and write out as each product repo's `AGENTS.md` and Claude Code files.

Full plan: `docs/otter-plan.md` (narrative) and `docs/otter.harness.yaml` (the plan as config — treat this as the spec). Rollout phases, gates, and the agreed decisions log live in `docs/phases/`. Start with `docs/README.md`.

## Current state

Phase 1 (Build), in progress. `org/`, `stacks/typescript-nextjs/`, and the sync CLI (`sync-cli/`) are scaffolded, with a drift check running in CI. The `new-nextjs-app` "template" is a recipe pointing at Next.js's own `create-next-app`, not an app we maintain in-repo. Still open, per `otter.harness.yaml`: the stack pack's preferred libraries and reference code (deliberately deferred), and an `ANTHROPIC_API_KEY` secret so the eval gate in CI actually runs.

## Tooling

This repo (and every repo on the `typescript-nextjs` stack) uses **mise** to pin Node and **pnpm** as the package manager — never `npm`/`npx`/`yarn`. Run `mise install` once per machine, then work from `sync-cli/` or `stacks/typescript-nextjs/evals/` with `pnpm install` / `pnpm test`, each of which has its own `package.json`. There's no root-level build — don't invent one.

## Working in this repo

- Treat `otter.harness.yaml` as the source of truth for structure and naming; if a change contradicts it, update the yaml and the plan together, don't drift from it silently.
- `TODO` markers in `otter.harness.yaml` are open decisions, not placeholders to invent values for — resolve them deliberately or leave them.
- Guardrails (security, permissions, tool allowlist) only tighten as they flow from org → stack → repo → developer; never loosen one at a lower layer.
- Conventional commits; small PRs with a clear description; every change ships with tests or a reason why not (per the org guidance in the plan).
- This file (`AGENTS.md`) is the shared core other agent tools read. `CLAUDE.md` is a symlink to it — edit `AGENTS.md`, never `CLAUDE.md` directly.
