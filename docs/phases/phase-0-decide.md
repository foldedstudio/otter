# Phase 0 · Decide

Weeks: 1

## Deliverables

- Confirm every developer's subscription has no-training terms; individual plans can differ from team or business plans.
- Pick two TypeScript/Next.js pilot repos.
- Baseline rework rate and change failure rate from recent PRs.

## Gate to pass

**A:** subscriptions checked; baselines recorded.

## Decisions (agreed 11 October 2026)

| Decision | Choice | What it changes |
| --- | --- | --- |
| Tools at launch | Claude Code; Codex and other CLI agents | Two adapters: Claude Code files and a shared AGENTS.md. No Cursor or Copilot output. |
| Eval reference tool | Claude Code | Eval suites run headless in CI through Claude Code. |
| Agent autonomy | Interactive, plus CI reviewers | CI agents comment on PRs with read-only access; no unattended PRs. |
| Repo layout | Many repos | One `otter.yaml` per repo; automated PRs keep pins current. |
| First stack | TypeScript with Next.js | The first stack pack is `typescript-nextjs`. |
| Sync tooling | Thin CLI on open formats | Author in AGENTS.md and skill conventions; a small script merges layers and checks drift. |
| Model gateway | Phase 3 | Phase 1 relies on each provider's admin console for logging. |
| Harness hosting | One harness monorepo, otter | `org/` and `stacks/<name>/` folders in one repo, with CODEOWNERS per folder. |
| Cost | Developers' own subscriptions | No central budget; cost tracking is limited to what each subscription reports. |
| Compliance | Standard commercial terms | Any approved provider with no-training terms. |
| Staffing | Part-time working group | Org layer built alongside normal work. |
| Success measure | Quality | AI-assisted PRs merged without major rework; change failure rate flat or better. |
| Scale | Under 5 developers, growing number of repos | Plan sized to match: six-week rollout, one harness lead (Anthony). |

## Follow-ups

- [ ] Confirm each developer's subscription carries no-training commercial terms; individual plans can differ from team or business plans.
- [x] Name the harness lead: Anthony Crowcroft.
- [x] Right-size the rollout and governance for a team of under 5.
