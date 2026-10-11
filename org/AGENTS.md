# Organisation layer

This is the floor every agent stands on, regardless of stack or repo. It is merged first; nothing below can loosen it. Source of truth for structure is `otter.harness.yaml`; this file is the guidance an agent actually reads.

## Guardrails (enforced by tooling, not advice)

**Data and secrets**

- Never send secrets, production credentials, `.env` files, or customer data to a model.
- Every model subscription in use must carry no-training commercial terms, checked at onboarding and quarterly.
- Secret scanning runs in pre-commit and CI; a hit blocks the commit/PR.

**Tools**

- Only `claude-code` and `codex` are approved agent tools.
- Only MCP servers on the allowlist in `org.yaml` may be used, at the pinned version: the GitHub MCP server (`ghcr.io/github/github-mcp-server`) and Playwright MCP (`@playwright/mcp`). Anything else is unapproved until it's added there.

**Permissions**

- Always denied, at every layer: production credentials, destructive commands (`rm -rf`, `git push --force`, `DROP TABLE` and equivalents), unapproved network access.
- Require explicit approval: installing a new dependency, changing CI config, changing a protected path.
- Codex runs with `sandbox_mode = "workspace-write"` and `approval_policy = "on-request"`. Lower layers may tighten these, never loosen them.

**CI reviewer agents**

- Read-only. They may comment on a pull request. They may never push, approve, or merge.

## Guidance (advice, most-specific-layer-wins)

- Conventional commits; small PRs with a clear description.
- Every change ships with tests, or a stated reason why not.
- No copyleft dependencies (GPL, AGPL, LGPL and similar) without explicit approval — it's case by case, not an outright ban, so ask rather than assume either way.

## Shared skills

Available to every agent regardless of stack, in `org/skills/`:

- `write-adr` — record an architecture decision
- `open-pr` — open a pull request that matches house style
- `upgrade-dependency` — bump a dependency safely
- `incident-writeup` — document an agent-caused incident

## How this file is produced and used

- This file is authored by hand and versioned with the rest of `org/`.
- The sync CLI (`sync-cli/`) reads it, merges it under the stack and repo layers per the precedence rules in `otter.harness.yaml`, and writes the product repo's `AGENTS.md` plus Claude Code's own files.
- Don't edit a product repo's generated `AGENTS.md` directly — edit the layer it came from and re-run the sync.
