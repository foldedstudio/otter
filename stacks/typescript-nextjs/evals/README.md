# typescript-nextjs evals

10–15 representative tasks with known-good outcomes, run headless through Claude Code on every change to this stack pack, per `otter.harness.yaml` (`stacks.typescript-nextjs.evals`). A release ships only if eval success doesn't drop versus the current harness version.

## Format

Each task is a YAML file in `tasks/`:

```yaml
id: kebab-case-id             # unique, matches the filename without .yaml
skill: add-page-or-route      # the stack skill this task exercises, if any
description: One sentence a human reviewer can judge the result against.
prompt: |
  The exact instruction given to the agent, as a user would phrase it.
checks:
  - type: file-exists
    path: app/example/page.tsx
  - type: file-contains
    path: app/example/page.tsx
    pattern: 'export default'
  - type: file-not-contains
    path: app/example/page.tsx
    pattern: '"use client"'
  - type: command             # only run if the fixture's deps are installed
    run: pnpm run lint
```

Check types: `file-exists`, `file-not-exists`, `file-contains`, `file-not-contains` (pattern is a JS regex, tested per-file), `command` (must exit 0).

## Fixture

`fixtures/base-app/` is a minimal Next.js App Router project with an `otter.yaml` manifest — just enough surface (one existing route, one existing lib util, configs) for tasks to act on realistically. Every task runs against a fresh copy of it; tasks never share state.

## Running

```
node run.mjs                              # all tasks, against this checkout's harness
node run.mjs add-ui-component             # a single task, by id
node run.mjs --harness <path> --json out.json  # another harness checkout; write a report
node compare.mjs current.json candidate.json   # exit 1 if candidate passes fewer tasks
```

Needs `sync-cli/` installed (`pnpm install` there) and `claude` on the PATH. The runner copies the fixture to a temp directory per task, syncs the harness under test into it with `otter-sync sync` (so the agent sees Otter's merged `AGENTS.md`, settings and skills — that's what's being evaluated), runs `claude -p` with the task's prompt and `--permission-mode acceptEdits`, then evaluates `checks` against the result. It installs dependencies (`pnpm install`) in the temp copy once, lazily, only if a task's checks include a `command` check — static tasks skip that cost.

Exit code is non-zero if any task fails. The release gate (`otter_release.evals-compare-current-vs-candidate` / `block-if-eval-success-drops` in `otter.harness.yaml`) is `.github/workflows/evals.yml`: on PRs touching `org/`, `stacks/`, or `sync-cli/src/`, it runs this PR's tasks against the base branch's harness and this PR's harness, then fails via `compare.mjs` if the candidate passes fewer. It needs an `ANTHROPIC_API_KEY` repo secret and skips with a warning without one. Results from LLM runs are noisy, so a single-task swing can fail the gate — rerun before digging in.

## Adding a task

Keep each task small enough that a human can judge "known-good" at a glance. Prefer structural checks (file exists, contains/doesn't contain a pattern) over running the full command set — reserve `command` checks for tasks specifically about build/lint/type correctness, since they're the slow path.
