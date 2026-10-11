# Organisation layer

This is the floor every agent stands on, regardless of stack or repo. It is merged first; nothing below can loosen it. Source of truth for structure is `otter.harness.yaml`; this file is the guidance an agent actually reads.

## Guardrails (enforced by tooling, not advice)

**Data and secrets**

- Never send secrets, production credentials, `.env` files, or customer data to a model.
- Every model subscription in use must carry no-training commercial terms, checked at onboarding and quarterly.
- Secret scanning runs in pre-commit and CI; a hit blocks the commit/PR.

**Tools**

- Only `claude-code` and `codex` are approved agent tools.
- Only MCP servers on the allowlist may be used, each with a pinned version. The allowlist is currently empty — treat "no server approved" as the default, not an oversight.

**Permissions**

- Always denied, at every layer: production credentials, destructive commands (`rm -rf`, `git push --force`, `DROP TABLE` and equivalents), unapproved network access.
- Require explicit approval: installing a new dependency, changing CI config, changing a protected path.
- Codex sandbox and approval mode: see `otter.harness.yaml` (`org.guardrails.permissions.codex`) — still marked `TODO`, don't assume a value.

**CI reviewer agents**

- Read-only. They may comment on a pull request. They may never push, approve, or merge.

## Guidance (advice, most-specific-layer-wins)

- Conventional commits; small PRs with a clear description.
- Every change ships with tests, or a stated reason why not.
- Respect the licence policy once it's confirmed (currently `TODO` in `otter.harness.yaml`) — don't pull in copyleft dependencies on the assumption it'll be fine.

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
