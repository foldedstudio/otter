# Plans

Planning material for Otter, our three-layer AI development harness.

| File | What it is |
| --- | --- |
| [otter-plan.md](otter-plan.md) | The full plan: layers, composition, verification, rollout, roles, risks and agreed decisions |
| [otter.harness.yaml](otter.harness.yaml) | The plan as config: the spec the `org/` and `stacks/` folders and the sync CLI are built against. `TODO` marks values still to confirm |

The live, commentable version of the plan is the Claude doc "Otter — AI Development Harness Plan". This folder is the copy that lives with the code.

## Where to start (Phase 1 · Build)

1. Scaffold `org/` (AGENTS.md, guardrails, shared skills) and `stacks/typescript-nextjs/` (commands, conventions, skills, templates, evals) from `otter.harness.yaml`.
2. Build the thin sync CLI: read a product repo's `otter.yaml`, merge org → stack → repo → developer by the precedence rules, and write `AGENTS.md` plus the Claude Code files.
3. Add a drift check so CI fails when committed agent files differ from a fresh sync.
4. Write the first 10–15 eval tasks and run them headless through Claude Code in CI.
5. Resolve the `TODO`s in `otter.harness.yaml` as you go.
