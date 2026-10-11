# Docs

Planning material for Otter, our three-layer AI development harness.

| File | What it is |
| --- | --- |
| [otter-plan.md](otter-plan.md) | The standing plan: layers, composition, verification, roles, risks. Rollout and decisions live in `phases/`. |
| [otter.harness.yaml](otter.harness.yaml) | The plan as config: the spec the `org/` and `stacks/` folders and the sync CLI are built against. `TODO` marks values still to confirm |
| [phases/](phases/) | One file per rollout phase — weeks, deliverables, gate to pass, and (for the phase in progress) current status |

The live, commentable version of the plan is the Claude doc "Otter — AI Development Harness Plan". This folder is the copy that lives with the code.

## Phases

| Phase | Weeks | Gate |
| --- | --- | --- |
| [0 · Decide](phases/phase-0-decide.md) | 1 | A: subscriptions checked; baselines recorded |
| [1 · Build](phases/phase-1-build.md) | 1–3 | B: sync output passes CI on both pilots; eval suite runs green — **in progress** |
| [2 · Pilot](phases/phase-2-pilot.md) | 3–4 | C: rework on AI-assisted PRs at or below baseline |
| [3 · Roll out](phases/phase-3-roll-out.md) | 5–6 | D: every active repo pinned; no guardrail breach has reached main |
| [4 · Operate](phases/phase-4-operate.md) | 7+ | — ongoing |
