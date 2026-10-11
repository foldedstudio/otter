# Phase 1 · Build

Weeks: 1–3

## Deliverables

- `otter` repo with `org/` and `stacks/typescript-nextjs/`.
- Sync CLI writing Claude Code files and `AGENTS.md`.
- 10–15 eval tasks running headless through Claude Code in CI.

## Gate to pass

**B:** sync output passes CI on both pilots; eval suite runs green.

## Status

Built so far:

- `org/` — `org.yaml`, `AGENTS.md`, and the four shared skills (`write-adr`, `open-pr`, `upgrade-dependency`, `incident-writeup`).
- `stacks/typescript-nextjs/` — `stack.yaml`, 6 convention docs, 4 skill docs, 12 eval tasks with a headless runner (`evals/run.mjs`) and fixture app, and a `new-nextjs-app` recipe pointing at `create-next-app` rather than an in-repo scaffold.
- `sync-cli/` — merges org → stack → repo, writes `AGENTS.md`/`CLAUDE.md`/`.claude/settings.json`/`.claude/skills/`; `otter-sync check` covers both file drift and stack tooling compliance. 16 passing tests.
- Drift check running in CI (`.github/workflows/ci.yml`) via `jdx/mise-action`; an example workflow for product repos at `sync-cli/examples/product-repo-drift-check.yml`.
- Resolved decisions: stack owner (anthony); MCP allowlist (GitHub MCP server, Playwright MCP, pinned in `org.yaml`); Codex `workspace-write` + `on-request` confirmed; licence policy kept as case-by-case approval for copyleft; `moment` and `lodash` banned for typescript-nextjs and enforced by `otter-sync check`.
- mise + pnpm adopted for this repo and enforced for the `typescript-nextjs` stack (tooling block, `non-pnpm-package-manager` guardrail, compliance check).

Still open:

- Stack pack: the preferred-libraries list and reference code are deliberately deferred (`TODO` in `stack.yaml`) until there's a repo worth pointing at.
- The eval runner isn't yet wired into CI as the release gate (`otter_release.evals-compare-current-vs-candidate` in `otter.harness.yaml`) — it runs standalone today.
- The developer layer (`~/.otter/developer.md`) isn't wired into `sync`/`check` — see `sync-cli/README.md`.
- No repo-template/manifest generator yet (Layer 3's "run one command, answer five questions" bootstrap).
- Gate B needs two real pilot repos to confirm against — that's Phase 2's job; what's here is the harness-side infrastructure Gate B depends on.
